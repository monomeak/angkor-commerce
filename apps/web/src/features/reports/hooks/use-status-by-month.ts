import { useMemo } from "react";
import { useInvoices } from "../../invoices/hooks/use-invoices";
import { MonthlyStatusBreakdown } from "../types/reports";
import { aggregateStatusByMonth } from "../lib/aggregate-status-by-month";

export function useStatusByMonth(): {
  data: MonthlyStatusBreakdown[];
  isLoading: boolean;
  isError: boolean;
} {
  const { data: invoices, isLoading, isError } = useInvoices();
  const data = useMemo(
    () => (invoices ? aggregateStatusByMonth(invoices) : []),
    [invoices],
  );
  return { data, isLoading, isError };
}
