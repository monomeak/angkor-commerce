import { useQuery } from "@tanstack/react-query";
import { useAppConfig } from "@/components/providers/app-config-provider";
import { fetchAllInvoices } from "../api/invoice-api";
import { invoiceKeys } from "../lib/query-keys";
import type { Invoice } from "../types/invoice";
// fetches the full invoice list once and caches it -- search/ filter / pagination are all derived client-side from this in useInvoiceList

export function useInvoices() {
  const { apiBaseUrl } = useAppConfig();

  return useQuery<Invoice[]>({
    queryKey: invoiceKeys.list(),
    queryFn: () => fetchAllInvoices(apiBaseUrl),
    staleTime: 5 * 60,
  });
}
