import { useInvoices } from "./use-invoices";
import type { Invoice } from "../types/invoice";
interface UseInvoiceDetailsResult {
  invoice: Invoice | undefined;
  isLoading: boolean;
  isError: boolean;
}

/**
 * We already fetch and cache the FULL invoice list in useInvoices(), so
 * looking up one invoice's details is just a `.find()` over data already
 * in memory — no second network request needed.
 */

export function useInvoiceDetails(
  invoiceId: string | null,
): UseInvoiceDetailsResult {
  const { data: invoices, isLoading, isError } = useInvoices();
  const invoice =
    invoiceId != null
      ? invoices?.find((inv) => inv.id === invoiceId)
      : undefined;
  return { invoice, isLoading, isError };
}
