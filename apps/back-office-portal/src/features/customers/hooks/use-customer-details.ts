import { useQuery } from "@tanstack/react-query";
import { useAppConfig } from "@/components/providers/app-config-provider";
import { fetchCustomerById } from "../api/customer-api";
import { customerKeys } from "../lib/query-keys";
import type { Customer } from "../types/customer";

export function useCustomerDetails(customerId: number | null) {
  const { apiBaseUrl } = useAppConfig();

  return useQuery<Customer>({
    queryKey:
      customerId != null ? customerKeys.detail(customerId) : customerKeys.all,
    queryFn: () => fetchCustomerById(apiBaseUrl, customerId as number),
    enabled: customerId != null,
  });
}
