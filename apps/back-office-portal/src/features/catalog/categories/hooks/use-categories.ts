"use client";

import { useQuery } from "@tanstack/react-query";
import { useMemo } from "react";
import { useAppConfig } from "@/components/providers/app-config-provider";
import { fetchCategories } from "../api/category-api";
import { categoryKeys } from "../lib/query-keys";
import { toCategoryOptions } from "../lib/category-tree";
import type { Category, CategoryOption } from "../types/category";

/**
 * Categories change rarely and every catalogue screen needs them, so this leans on a long
 * staleTime rather than refetching per mount.
 */
export function useCategories() {
    const { apiBaseUrl } = useAppConfig();

    return useQuery<Category[]>({
        queryKey: categoryKeys.list(),
        queryFn: () => fetchCategories(apiBaseUrl),
        staleTime: 10 * 60 * 1000
    });
}

/** Flattened "Parent › Child" labels for the filter bar and the product form's select. */
export function useCategoryOptions(): { options: CategoryOption[]; isLoading: boolean } {
    const { data, isLoading } = useCategories();

    const options = useMemo(() => toCategoryOptions(data ?? []), [data]);

    return { options, isLoading };
}
