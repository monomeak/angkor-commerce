"use client";

import { useQueries } from "@tanstack/react-query";
import { useAppConfig } from "@/components/providers/app-config-provider";
import { fetchProducts } from "../../products/api/product-api";
import { productKeys } from "../../products/lib/query-keys";
import { MAX_PAGE_SIZE } from "../../products/lib/constants";
import type { ProductListParams, ProductSummary } from "../../products/types/product";
import type { Category } from "../../categories/types/category";

export interface CategoryInventory {
    category: Category;
    products: ProductSummary[];
    /** Total matching the filter, which may exceed what was fetched. */
    total: number;
    totalStock: number;
    lowStockCount: number;
    isLoading: boolean;
    isError: boolean;
}

function paramsForCategory(categoryId: number): ProductListParams {
    return {
        categoryId,
        // Inventory is a per-category overview, not a browsing surface — one page of up to
        // 100 rows per card is enough, and the count comes from `total` regardless.
        skip: 0,
        limit: MAX_PAGE_SIZE,
        sortBy: "name",
        order: "asc"
    };
}

/**
 * One request per category rather than fetching everything and grouping client-side: the
 * list endpoint returns a flattened category *name* with no id, so grouping locally would
 * mean matching on a display string. Asking per categoryId is unambiguous.
 *
 * useQueries keeps each card independently cached and independently refreshable.
 */
export function useInventoryByCategory(categories: Category[], lowStockThreshold: number): CategoryInventory[] {
    const { apiBaseUrl } = useAppConfig();

    const results = useQueries({
        queries: categories.map((category) => {
            const params = paramsForCategory(category.id);

            return {
                queryKey: productKeys.list(params),
                queryFn: () => fetchProducts(apiBaseUrl, params),
                staleTime: 60 * 1000
            };
        })
    });

    return categories.map((category, index) => {
        const result = results[index];
        const products = result?.data?.products ?? [];

        return {
            category,
            products,
            total: result?.data?.total ?? 0,
            totalStock: products.reduce((sum, product) => sum + product.totalStock, 0),
            lowStockCount: products.filter((product) => product.totalStock <= lowStockThreshold).length,
            isLoading: result?.isPending ?? true,
            isError: result?.isError ?? false
        };
    });
}
