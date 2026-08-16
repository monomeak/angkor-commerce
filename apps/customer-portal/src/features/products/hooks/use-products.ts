"use client";

import { useQuery } from "@tanstack/react-query";
import { useAppConfig } from "@/components/providers/app-config-provider";
import { fetchProducts } from "../api/product-api";
import { productKeys } from "../lib/query-keys";
import type { ProductListParams } from "../types/product";

/**
 * For client-rendered grids (the home page sections). The category and search pages fetch on
 * the server instead — they are indexable storefront pages, so their products belong in the
 * initial HTML rather than behind a loading skeleton.
 */
export function useProductsQuery(params: ProductListParams = {}) {
    const { apiBaseUrl } = useAppConfig();

    return useQuery({
        queryKey: productKeys.list(params),
        queryFn: () => fetchProducts(apiBaseUrl, params)
    });
}
