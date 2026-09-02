import type { CustomerListParams } from "../types/customer";

/**
 * Owned by this feature (see AGENTS.md). The whole param object is part of the list key:
 * filtering, sorting and paging are server-side, so two param sets are two cache entries.
 */
export const customerKeys = {
    all: ["customers"] as const,
    lists: () => [...customerKeys.all, "list"] as const,
    list: (params: CustomerListParams) => [...customerKeys.lists(), params] as const,
    details: () => [...customerKeys.all, "detail"] as const,
    detail: (id: number) => [...customerKeys.details(), id] as const
};
