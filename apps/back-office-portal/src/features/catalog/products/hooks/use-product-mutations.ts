"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useAppConfig } from "@/components/providers/app-config-provider";
import {
    addVariant,
    archiveProduct,
    createProduct,
    deleteVariant,
    fetchProduct,
    restoreProduct,
    updateProduct,
    updateVariant,
    type CreateProductPayload
} from "../api/product-api";
import { productKeys } from "../lib/query-keys";
import { reconcileVariants, type VariantRowInput } from "../lib/reconcile-variants";
import type { ArchivedProduct, Product, ProductVariant } from "../types/product";

export function useCreateProduct() {
    const queryClient = useQueryClient();
    const { apiBaseUrl } = useAppConfig();

    return useMutation<Product, unknown, CreateProductPayload>({
        mutationFn: (payload) => createProduct(apiBaseUrl, payload),
        onSuccess: () => queryClient.invalidateQueries({ queryKey: productKeys.lists() })
    });
}

export interface UpdateProductInput {
    id: number;
    /** Already diffed by buildPatchBody() — may be empty when only variants changed. */
    body: Record<string, unknown>;
    variantRows: VariantRowInput[];
    existingVariants: ProductVariant[];
}

/**
 * One user-visible "save" spans several requests: the product PATCH plus a call per changed
 * variant. They run in sequence rather than in parallel — a failure partway through leaves
 * the earlier writes applied, and sequencing at least makes the failure point predictable.
 * The refetch at the end means the form always re-renders from server truth rather than
 * from an optimistic guess about what landed.
 */
export function useUpdateProduct() {
    const queryClient = useQueryClient();
    const { apiBaseUrl } = useAppConfig();

    return useMutation<Product, unknown, UpdateProductInput>({
        mutationFn: async ({ id, body, variantRows, existingVariants }) => {
            if (Object.keys(body).length > 0) {
                await updateProduct(apiBaseUrl, id, body);
            }

            const { created, updated, deletedIds } = reconcileVariants(variantRows, existingVariants);

            for (const payload of created) {
                await addVariant(apiBaseUrl, id, payload);
            }
            for (const { id: variantId, payload } of updated) {
                await updateVariant(apiBaseUrl, id, variantId, payload);
            }
            for (const variantId of deletedIds) {
                await deleteVariant(apiBaseUrl, id, variantId);
            }

            return fetchProduct(apiBaseUrl, id);
        },
        onSuccess: (product) => {
            queryClient.setQueryData(productKeys.detail(product.id), product);
            queryClient.invalidateQueries({ queryKey: productKeys.lists() });
        }
    });
}

export function useArchiveProduct() {
    const queryClient = useQueryClient();
    const { apiBaseUrl } = useAppConfig();

    return useMutation<ArchivedProduct, unknown, number>({
        mutationFn: (id) => archiveProduct(apiBaseUrl, id),
        onSuccess: (_result, id) => {
            queryClient.invalidateQueries({ queryKey: productKeys.lists() });
            queryClient.invalidateQueries({ queryKey: productKeys.detail(id) });
        }
    });
}

export function useRestoreProduct() {
    const queryClient = useQueryClient();
    const { apiBaseUrl } = useAppConfig();

    return useMutation<Product, unknown, number>({
        mutationFn: (id) => restoreProduct(apiBaseUrl, id),
        onSuccess: (product) => {
            queryClient.setQueryData(productKeys.detail(product.id), product);
            queryClient.invalidateQueries({ queryKey: productKeys.lists() });
        }
    });
}
