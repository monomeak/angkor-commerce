"use client";

import { useMutation, useQueryClient, type QueryClient } from "@tanstack/react-query";

import { useAppConfig } from "@/components/providers/app-config-provider";
import { addToWishlist, clearWishlist, removeFromWishlist } from "../api/wishlist-api";
import { wishlistKeys } from "../lib/query-keys";
import { useIsWishlisted } from "./use-wishlist";

/*
 * The id list is patched optimistically so a heart answers the tap; the item list is not,
 * because it shows prices and stock the client would have to invent. Both are invalidated
 * on settle.
 */
type IdsSnapshot = { readonly previous: number[] | undefined };

async function patchProductIds(queryClient: QueryClient, patch: (ids: number[]) => number[]): Promise<IdsSnapshot> {
    await queryClient.cancelQueries({ queryKey: wishlistKeys.productIds() });
    const previous = queryClient.getQueryData<number[]>(wishlistKeys.productIds());

    if (previous) {
        queryClient.setQueryData<number[]>(wishlistKeys.productIds(), patch(previous));
    }

    return { previous };
}

function restoreProductIds(queryClient: QueryClient, snapshot: IdsSnapshot | undefined) {
    if (snapshot?.previous) {
        queryClient.setQueryData<number[]>(wishlistKeys.productIds(), snapshot.previous);
    }
}

export function useAddToWishlist() {
    const queryClient = useQueryClient();
    const { apiBaseUrl } = useAppConfig();

    return useMutation({
        mutationFn: (productId: number) => addToWishlist(apiBaseUrl, productId),
        onMutate: (productId) =>
            patchProductIds(queryClient, (ids) => (ids.includes(productId) ? ids : [productId, ...ids])),
        onError: (_error, _productId, snapshot) => restoreProductIds(queryClient, snapshot),
        onSettled: () => queryClient.invalidateQueries({ queryKey: wishlistKeys.all })
    });
}

export function useRemoveFromWishlist() {
    const queryClient = useQueryClient();
    const { apiBaseUrl } = useAppConfig();

    return useMutation({
        mutationFn: (productId: number) => removeFromWishlist(apiBaseUrl, productId),
        onMutate: (productId) => patchProductIds(queryClient, (ids) => ids.filter((id) => id !== productId)),
        onError: (_error, _productId, snapshot) => restoreProductIds(queryClient, snapshot),
        onSettled: () => queryClient.invalidateQueries({ queryKey: wishlistKeys.all })
    });
}

export function useClearWishlist() {
    const queryClient = useQueryClient();
    const { apiBaseUrl } = useAppConfig();

    return useMutation({
        mutationFn: () => clearWishlist(apiBaseUrl),
        onMutate: () => patchProductIds(queryClient, () => []),
        onError: (_error, _variables, snapshot) => restoreProductIds(queryClient, snapshot),
        onSettled: () => queryClient.invalidateQueries({ queryKey: wishlistKeys.all })
    });
}

/** One product's saved state and the switch that flips it — what every heart binds to. */
export function useWishlistToggle(productId: number) {
    const isWishlisted = useIsWishlisted(productId);
    const add = useAddToWishlist();
    const remove = useRemoveFromWishlist();

    return {
        isWishlisted,
        isPending: add.isPending || remove.isPending,
        error: add.error ?? remove.error,
        toggle: () => {
            if (add.isPending || remove.isPending) {
                return;
            }

            // Resetting the other direction keeps `error` unambiguous — a failed save must
            // not still show after the shopper successfully unsaved.
            if (isWishlisted) {
                add.reset();
                remove.mutate(productId);
            } else {
                remove.reset();
                add.mutate(productId);
            }
        }
    };
}
