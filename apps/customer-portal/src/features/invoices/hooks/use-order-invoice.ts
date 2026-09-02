"use client";

import { useQuery } from "@tanstack/react-query";

import { useAppConfig } from "@/components/providers/app-config-provider";
import { useCurrentCustomer } from "@/src/features/auth/hooks/use-current-customer";
import { fetchOrderInvoice } from "../api/invoice-api";
import { invoiceKeys } from "../lib/query-keys";

/**
 * The receipt for an order, or null while it is still unpaid. Only asked for once the order
 * is `invoiced` — an earlier call is a guaranteed 404.
 */
export function useOrderInvoiceQuery(orderId: number, enabled: boolean) {
    const { data: customer } = useCurrentCustomer();
    const { apiBaseUrl } = useAppConfig();

    return useQuery({
        queryKey: invoiceKeys.forOrder(orderId),
        queryFn: () => fetchOrderInvoice(apiBaseUrl, orderId),
        enabled: enabled && Boolean(customer) && Number.isFinite(orderId),
        // A settled receipt never changes; nothing in the storefront can amend one.
        staleTime: Infinity
    });
}
