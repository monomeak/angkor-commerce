import { useQuery } from "@tanstack/react-query";
import { fetchCustomers } from "../api/customer-api";
import { customerKeys } from "../lib/query-keys";

import type {
  CustomerListFilters,
  CustomerListResult,
} from "../types/customer";

export function useCustomers(filters: CustomerListFilters) {
  return useQuery<CustomerListResult>({
    queryKey: customerKeys.list(filters),
    queryFn: () => fetchCustomers(filters),
    staleTime: 60 * 1000,
    placeholderData: (previousData) => previousData, // keep old rows visible while the next page loads.
  });
}
