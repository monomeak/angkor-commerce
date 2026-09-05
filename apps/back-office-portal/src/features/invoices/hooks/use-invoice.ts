"use client";

import { useQuery } from "@tanstack/react-query";
import { useAppConfig } from "@/components/providers/app-config-provider";
import { fetchInvoice } from "../api/invoice-api";
import { invoiceKeys } from "../lib/query-keys";
import type { Invoice } from "../types/invoice";

/** One invoice in full — items and payments, which the list rows do not carry. */
export function useInvoice(invoiceId: number) {
    const { apiBaseUrl } = useAppConfig();

    return useQuery<Invoice>({
        queryKey: invoiceKeys.detail(invoiceId),
        queryFn: () => fetchInvoice(apiBaseUrl, invoiceId),
        enabled: Number.isInteger(invoiceId)
    });
}
