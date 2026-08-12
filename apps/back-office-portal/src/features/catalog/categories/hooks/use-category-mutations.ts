"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useAppConfig } from "@/components/providers/app-config-provider";
import { createCategory, deleteCategory, updateCategory, type CreateCategoryPayload } from "../api/category-api";
import { categoryKeys } from "../lib/query-keys";
import type { Category } from "../types/category";

export function useCreateCategory() {
    const queryClient = useQueryClient();
    const { apiBaseUrl } = useAppConfig();

    return useMutation<Category, unknown, CreateCategoryPayload>({
        mutationFn: (payload) => createCategory(apiBaseUrl, payload),
        onSuccess: () => queryClient.invalidateQueries({ queryKey: categoryKeys.all })
    });
}

export function useUpdateCategory() {
    const queryClient = useQueryClient();
    const { apiBaseUrl } = useAppConfig();

    return useMutation<Category, unknown, { id: number; payload: CreateCategoryPayload }>({
        mutationFn: ({ id, payload }) => updateCategory(apiBaseUrl, id, payload),
        onSuccess: () => queryClient.invalidateQueries({ queryKey: categoryKeys.all })
    });
}

export function useDeleteCategory() {
    const queryClient = useQueryClient();
    const { apiBaseUrl } = useAppConfig();

    return useMutation<void, unknown, number>({
        mutationFn: (id) => deleteCategory(apiBaseUrl, id),
        onSuccess: () => queryClient.invalidateQueries({ queryKey: categoryKeys.all })
    });
}
