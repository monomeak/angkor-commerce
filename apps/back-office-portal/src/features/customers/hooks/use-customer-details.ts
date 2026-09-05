"use client";

import { useQuery } from "@tanstack/react-query";
import { useAppConfig } from "@/components/providers/app-config-provider";
import { fetchCustomer } from "../api/customer-api";
import { customerKeys } from "../lib/query-keys";
import type { Customer } from "../types/customer";

/**
 * The dialog refetches the row it was opened from rather than being handed it: the list and
 * detail endpoints return the same shape, so this is a freshness check, and a customer opened
 * from a stale page shows current data.
 */
export function useCustomerDetails(customerId: number | null) {
    const { apiBaseUrl } = useAppConfig();

    return useQuery<Customer>({
        queryKey: customerKeys.detail(customerId ?? 0),
        queryFn: () => fetchCustomer(apiBaseUrl, customerId as number),
        enabled: customerId !== null
    });
}
