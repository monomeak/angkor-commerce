import type { ProductListParams } from "../types/product";

/**
 * Owned by this feature (see AGENTS.md). `lists()` is the invalidation target after any
 * mutation — invalidating the whole `all` prefix would also blow away detail queries the
 * user is still looking at.
 */
export const productKeys = {
    all: ["catalog", "products"] as const,
    lists: () => [...productKeys.all, "list"] as const,
    list: (params: ProductListParams) => [...productKeys.lists(), params] as const,
    details: () => [...productKeys.all, "detail"] as const,
    detail: (id: number) => [...productKeys.details(), id] as const
};
