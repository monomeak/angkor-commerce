import type { InvoiceListParams } from "../types/invoice";

/**
 * Owned by this feature (see AGENTS.md). The mock model under `mock/` keys itself separately
 * as ["invoices", "mock"], so the dashboard's cached carts never collide with these rows.
 */
export const invoiceKeys = {
    all: ["invoices"] as const,
    lists: () => [...invoiceKeys.all, "list"] as const,
    list: (params: InvoiceListParams) => [...invoiceKeys.lists(), params] as const,
    details: () => [...invoiceKeys.all, "detail"] as const,
    detail: (id: number) => [...invoiceKeys.details(), id] as const
};
