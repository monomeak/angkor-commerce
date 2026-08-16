"use client";

import { useQuery } from "@tanstack/react-query";
import { useAppConfig } from "@/components/providers/app-config-provider";
import { fetchCategories } from "../api/category-api";
import { categoryKeys } from "../lib/query-keys";
import type { Category } from "../types/category";

/**
 * Categories change about as often as the shop's navigation does, and every grid, menu and
 * breadcrumb on the site wants the same flat list — so it is cached long and shared rather
 * than refetched per view.
 *
 * Server components skip this and call fetchCategories() with getAppConfig().apiBaseUrl
 * directly; useAppConfig() only exists in the browser tree.
 */
export function useCategoriesQuery() {
    const { apiBaseUrl } = useAppConfig();

    return useQuery({
        queryKey: categoryKeys.list(),
        queryFn: () => fetchCategories(apiBaseUrl),
        staleTime: 5 * 60 * 1000
    });
}

/** The list on its own, defaulted to empty — the common case for shaping helpers. */
export function useCategories(): Category[] {
    return useCategoriesQuery().data ?? [];
}
