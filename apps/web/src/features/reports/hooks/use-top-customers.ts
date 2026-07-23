import { useMemo } from "react";
import { useInvoices } from "../../invoices/hooks/use-invoices";
import { TopCustomerWithDetails } from "../types/reports";
import { aggregateTopCustomer } from "../lib/aggregate-top-customers";
import { useQueries } from "@tanstack/react-query";
import { customerKeys } from "../../customers/lib/query-keys";
import { fetchCustomerById } from "../../customers/api/customer-api";
import { filterInvoicesByRecentMonths } from "../lib/filter-invoices-by-recent-months";
const TOP_N = 5;
export function useTopCustomers(months?: number): {
  data: TopCustomerWithDetails[];
  isLoading: boolean;
} {
  const { data: invoices, isLoading: invoiceLoading } = useInvoices();
  const topRevenue = useMemo(
    () =>
      invoices
        ? aggregateTopCustomer(
            filterInvoicesByRecentMonths(invoices, months),
            TOP_N,
          )
        : [],
    [invoices, months],
  );

  const customerQueries = useQueries({
    queries: topRevenue.map((entry) => ({
      queryKey: customerKeys.detail(entry.userId),
      queryFn: () => fetchCustomerById(entry.userId),
      staletime: 5 * 60 * 1000,
    })),
  });

  const isLoading = invoiceLoading || customerQueries.some((q) => q.isLoading);
  const data: TopCustomerWithDetails[] = useMemo(() => {
    return topRevenue.map((entry, index) => {
      const customer = customerQueries[index]?.data;

      return {
        ...entry,
        fullName: customer?.fullName ?? `Customer #${entry.userId}`,
        email: customer?.email ?? "",
        avatarUrl: customer?.avatarUrl ?? "",
        company: customer?.company.name ?? "",
      };
    });
  }, [topRevenue, customerQueries]);
  return { data, isLoading };
}
