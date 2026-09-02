"use client";

import { keepPreviousData, useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import { useAppConfig } from "@/components/providers/app-config-provider";
import { useCurrentCustomer } from "@/src/features/auth/hooks/use-current-customer";
import { cancelMyOrder, fetchMyOrder, fetchMyOrders } from "../api/order-api";
import { orderKeys } from "../lib/query-keys";

export function useOrdersQuery(page: number) {
    const { data: customer } = useCurrentCustomer();
    const { apiBaseUrl } = useAppConfig();

    return useQuery({
        queryKey: orderKeys.list(page),
        queryFn: () => fetchMyOrders(apiBaseUrl, page),
        enabled: Boolean(customer),
        placeholderData: keepPreviousData
    });
}

export function useOrderQuery(orderId: number) {
    const { data: customer } = useCurrentCustomer();
    const { apiBaseUrl } = useAppConfig();

    return useQuery({
        queryKey: orderKeys.detail(orderId),
        queryFn: () => fetchMyOrder(apiBaseUrl, orderId),
        enabled: Boolean(customer) && Number.isFinite(orderId)
    });
}

/** Cancelling changes the status and the stock behind it, so the whole tree is refetched. */
export function useCancelOrder() {
    const queryClient = useQueryClient();
    const { apiBaseUrl } = useAppConfig();

    return useMutation({
        mutationFn: (orderId: number) => cancelMyOrder(apiBaseUrl, orderId),
        onSuccess: () => queryClient.invalidateQueries({ queryKey: orderKeys.all })
    });
}
