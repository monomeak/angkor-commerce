import type { ProductListParams } from "../types/product";

export const productKeys = {
    all: ["products"] as const,
    // The whole param object is part of the key: filters and paging are server-side now, so
    // two different filter sets are two different cache entries, not one list filtered twice.
    list: (params: ProductListParams) => [...productKeys.all, "list", params] as const,
    detail: (id: number) => [...productKeys.all, "detail", id] as const
};
