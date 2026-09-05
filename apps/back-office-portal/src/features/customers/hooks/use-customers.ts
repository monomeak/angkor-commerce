"use client";

import { keepPreviousData, useQuery } from "@tanstack/react-query";
import { useAppConfig } from "@/components/providers/app-config-provider";
import { fetchCustomers } from "../api/customer-api";
import { customerKeys } from "../lib/query-keys";
import type { CustomerListParams, CustomerListResult } from "../types/customer";

export function useCustomers(params: CustomerListParams) {
    const { apiBaseUrl } = useAppConfig();

    return useQuery<CustomerListResult>({
        queryKey: customerKeys.list(params),
        queryFn: () => fetchCustomers(apiBaseUrl, params),
        // Paging and filtering otherwise blank the table on every keystroke; keeping the
        // previous page visible while the next one loads avoids a full-height layout jump.
        placeholderData: keepPreviousData
    });
}
