"use client";

import { keepPreviousData, useQuery } from "@tanstack/react-query";
import { useAppConfig } from "@/components/providers/app-config-provider";
import { fetchInvoices } from "../api/invoice-api";
import { invoiceKeys } from "../lib/query-keys";
import type { InvoiceListParams, InvoiceListResult } from "../types/invoice";

/**
 * One page of invoices, filtered and sorted by core-api. Note this is not the same thing as
 * `mock/use-invoices.ts`, which fetches every DummyJSON cart at once for the dashboard —
 * that one is going away with the screens still built on it.
 */
export function useInvoices(params: InvoiceListParams) {
    const { apiBaseUrl } = useAppConfig();

    return useQuery<InvoiceListResult>({
        queryKey: invoiceKeys.list(params),
        queryFn: () => fetchInvoices(apiBaseUrl, params),
        // Keeps the current page on screen while the next loads, so paging and typing in the
        // search box don't collapse the table to its empty height.
        placeholderData: keepPreviousData
    });
}
