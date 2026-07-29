import { useMemo } from "react";
import { useInvoices } from "./use-invoices";
import type { Invoice, InvoiceListFilters } from "../types/invoice";

interface UseInvoiceListResult {
  invoices: Invoice[];
  total: number;
  pageCount: number;
  currentPage: number;
  isLoading: boolean;
  isError: boolean;
  error: Error | null;
}
/**
 * Pure client-side derivation on top of the fully-cached invoice list.
 * No network call here — just filtering/paginating an array already in
 * memory, so typing in the search box or flipping pages is instant.
 */
export function useInvoiceList(
  filters: InvoiceListFilters,
): UseInvoiceListResult {
  const { data: allInvoices, isLoading, isError, error } = useInvoices();

  const filtered = useMemo(() => {
    if (!allInvoices) return [];
    const query = filters.search.trim().toLowerCase();

    return allInvoices.filter((invoice) => {
      const issuedDate = invoice.issuedDate.slice(0, 10);
      const dueDate = invoice.dueDate.slice(0, 10);
      const matchesSearch =
        query.length === 0 ||
        invoice.invoiceNumber.toLocaleLowerCase().includes(query) ||
        invoice.client.name.toLocaleLowerCase().includes(query) ||
        invoice.client.email.toLocaleLowerCase().includes(query);
      const matchesStatus =
        filters.status === "all" || invoice.status === filters.status;
      const matchesIssuedDate =
        (!filters.issuedDateFrom || issuedDate >= filters.issuedDateFrom) &&
        (!filters.issuedDateTo || issuedDate <= filters.issuedDateTo);
      const matchesDueDate =
        (!filters.dueDateFrom || dueDate >= filters.dueDateFrom) &&
        (!filters.dueDateTo || dueDate <= filters.dueDateTo);

      return (
        matchesSearch &&
        matchesStatus &&
        matchesIssuedDate &&
        matchesDueDate
      );
    });
  }, [
    allInvoices,
    filters.search,
    filters.status,
    filters.issuedDateFrom,
    filters.issuedDateTo,
    filters.dueDateFrom,
    filters.dueDateTo,
  ]);

  const total = filtered.length;
  const pageCount = Math.max(1, Math.ceil(total / filters.pageSize));
  const currentPage = Math.min(Math.max(1, filters.page), pageCount);

  const paginated = useMemo(() => {
    const start = (currentPage - 1) * filters.pageSize;
    return filtered.slice(start, start + filters.pageSize);
  }, [filtered, currentPage, filters.pageSize]);
  return {
    invoices: paginated,
    total,
    pageCount,
    currentPage,
    isLoading,
    isError,
    error: error as Error | null,
  };
}
