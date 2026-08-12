"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useAppConfig } from "@/components/providers/app-config-provider";
import { deleteProductImage, uploadProductImage } from "../api/product-api";
import { productKeys } from "../lib/query-keys";
import type { ProductImage } from "../types/product";

/**
 * Images are managed against a saved product, so both of these invalidate the detail query
 * rather than trying to patch the cache by hand: the API also rewrites the product's
 * thumbnail when the image backing it is deleted, and only a refetch reflects that.
 */
export function useUploadProductImage(productId: number) {
    const queryClient = useQueryClient();
    const { apiBaseUrl } = useAppConfig();

    return useMutation<ProductImage, unknown, File>({
        mutationFn: (file) => uploadProductImage(apiBaseUrl, productId, file),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: productKeys.detail(productId) });
            // The list shows the thumbnail, which the first upload sets.
            queryClient.invalidateQueries({ queryKey: productKeys.lists() });
        }
    });
}

export function useDeleteProductImage(productId: number) {
    const queryClient = useQueryClient();
    const { apiBaseUrl } = useAppConfig();

    return useMutation<void, unknown, number>({
        mutationFn: (imageId) => deleteProductImage(apiBaseUrl, productId, imageId),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: productKeys.detail(productId) });
            queryClient.invalidateQueries({ queryKey: productKeys.lists() });
        }
    });
}
