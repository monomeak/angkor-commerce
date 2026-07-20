import { useQuery } from "@tanstack/react-query";
import { fetchAllInvoices } from "../api/invoice-api";
import { invoiceKeys } from "../lib/query-keys";
import type { Invoice } from "../types/invoice";
// fetches the full invoice list once and caches it -- search/ filter / pagination are all derived client-side from this in useInvoiceList

export function useInvoices() {
  return useQuery<Invoice[]>({
    queryKey: invoiceKeys.list(),
    queryFn: fetchAllInvoices,
    staleTime: 5 * 60,
  });
}
