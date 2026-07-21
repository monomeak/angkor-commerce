import { useQuery } from "@tanstack/react-query";
import { fetchCustomerById } from "../api/customer-api";
import { customerKeys } from "../lib/query-keys";
import type { Customer } from "../types/customer";

export function useCustomerDetails(customerId: number | null) {
  return useQuery<Customer>({
    queryKey:
      customerId != null ? customerKeys.detail(customerId) : customerKeys.all,
    queryFn: () => fetchCustomerById(customerId as number),
    enabled: customerId != null,
  });
}
