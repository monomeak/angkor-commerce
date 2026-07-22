import type { CustomerListFilters } from "../types/customer";

export const customerKeys = {
  all: ["customers"] as const,
  list: (filters: CustomerListFilters) =>
    [...customerKeys.all, "list", filters] as const,
  detail: (id: number) => [...customerKeys.all, id] as const,
};
