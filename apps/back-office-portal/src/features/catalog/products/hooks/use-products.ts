"use client";

import { keepPreviousData, useQuery } from "@tanstack/react-query";
import { useAppConfig } from "@/components/providers/app-config-provider";
import { fetchProducts } from "../api/product-api";
import { productKeys } from "../lib/query-keys";
import type { ProductListParams, ProductListResult } from "../types/product";

export function useProducts(params: ProductListParams) {
    const { apiBaseUrl } = useAppConfig();

    return useQuery<ProductListResult>({
        queryKey: productKeys.list(params),
        queryFn: () => fetchProducts(apiBaseUrl, params),
        // Paging and filtering otherwise blank the table on every keystroke; keeping the
        // previous page visible while the next one loads avoids a full-height layout jump.
        placeholderData: keepPreviousData
    });
}
