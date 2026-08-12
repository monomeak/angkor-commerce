"use client";

import { useQuery } from "@tanstack/react-query";
import { useAppConfig } from "@/components/providers/app-config-provider";
import { fetchProduct } from "../api/product-api";
import { productKeys } from "../lib/query-keys";
import type { Product } from "../types/product";

export function useProduct(id: number | undefined) {
    const { apiBaseUrl } = useAppConfig();

    return useQuery<Product>({
        queryKey: productKeys.detail(id ?? 0),
        queryFn: () => fetchProduct(apiBaseUrl, id as number),
        enabled: typeof id === "number" && Number.isFinite(id)
    });
}
