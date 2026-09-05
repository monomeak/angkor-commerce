import { useMemo } from "react";
import { useInvoices } from "../../invoices/mock/use-invoices";
import { TopCustomerWithDetails } from "../types/reports";
import { aggregateTopCustomer } from "../lib/aggregate-top-customers";
import { useQueries } from "@tanstack/react-query";
import { customerKeys } from "../../customers/lib/query-keys";
import { fetchCustomer } from "../../customers/api/customer-api";
import { useAppConfig } from "@/components/providers/app-config-provider";
import { filterInvoicesByRecentMonths } from "../lib/filter-invoices-by-recent-months";
const TOP_N = 5;
export function useTopCustomers(months?: number): {
  data: TopCustomerWithDetails[];
  isLoading: boolean;
} {
  const { apiBaseUrl } = useAppConfig();
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
    /*
     * The ids come from DummyJSON invoices while /customers is core-api, so most lookups
     * 404 until the invoice feature is ported. A miss falls back to "Customer #id" below;
     * retry: false keeps a screenful of misses from becoming three rounds of requests.
     */
    queries: topRevenue.map((entry) => ({
      queryKey: customerKeys.detail(entry.userId),
      queryFn: () => fetchCustomer(apiBaseUrl, entry.userId),
      staleTime: 5 * 60 * 1000,
      retry: false,
    })),
  });

  const isLoading = invoiceLoading || customerQueries.some((q) => q.isLoading);
  const data: TopCustomerWithDetails[] = useMemo(() => {
    return topRevenue.map((entry, index) => {
      const customer = customerQueries[index]?.data;

      return {
        ...entry,
        fullName: customer?.displayName ?? `Customer #${entry.userId}`,
        email: customer?.email ?? "",
        avatarUrl: customer?.image ?? "",
        company: customer?.companyName ?? "",
      };
    });
  }, [topRevenue, customerQueries]);
  return { data, isLoading };
}
