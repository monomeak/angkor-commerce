import { useQuery } from "@tanstack/react-query";
import { useAppConfig } from "@/components/providers/app-config-provider";
import { fetchCustomers } from "../api/customer-api";
import { customerKeys } from "../lib/query-keys";

import type {
  CustomerListFilters,
  CustomerListResult,
} from "../types/customer";

export function useCustomers(filters: CustomerListFilters) {
  const { apiBaseUrl } = useAppConfig();

  return useQuery<CustomerListResult>({
    queryKey: customerKeys.list(filters),
    queryFn: () => fetchCustomers(apiBaseUrl, filters),
    staleTime: 60 * 1000,
    placeholderData: (previousData) => previousData, // keep old rows visible while the next page loads.
  });
}
