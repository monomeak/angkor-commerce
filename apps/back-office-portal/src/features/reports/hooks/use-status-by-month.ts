import { useMemo } from "react";
import { useInvoices } from "../../invoices/mock/use-invoices";
import { MonthlyStatusBreakdown } from "../types/reports";
import { aggregateStatusByMonth } from "../lib/aggregate-status-by-month";
import { filterInvoicesByRecentMonths } from "../lib/filter-invoices-by-recent-months";

export function useStatusByMonth(months?: number): {
  data: MonthlyStatusBreakdown[];
  isLoading: boolean;
  isError: boolean;
} {
  const { data: invoices, isLoading, isError } = useInvoices();
  const data = useMemo(
    () =>
      invoices
        ? aggregateStatusByMonth(
            filterInvoicesByRecentMonths(invoices, months),
          )
        : [],
    [invoices, months],
  );
  return { data, isLoading, isError };
}
