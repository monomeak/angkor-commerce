"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";

import { useAppConfig } from "@/components/providers/app-config-provider";
import { createOrder } from "@/src/features/orders/api/order-api";
import { orderKeys } from "@/src/features/orders/lib/query-keys";
import type { CreateOrderPayload, Order } from "@/src/features/orders/types/order";

/**
 * Placing the order is its own step, deliberately separate from paying for it: the order
 * exists, holds its stock and is visible in the history the moment this succeeds, even if
 * the payment that follows fails. Retrying the payment then never creates a second order.
 */
export function usePlaceOrder() {
    const queryClient = useQueryClient();
    const { apiBaseUrl } = useAppConfig();

    return useMutation<Order, unknown, CreateOrderPayload>({
        mutationFn: (payload) => createOrder(apiBaseUrl, payload),
        onSuccess: () => queryClient.invalidateQueries({ queryKey: orderKeys.all })
    });
}
