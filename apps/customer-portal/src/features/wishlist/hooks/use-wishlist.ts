"use client";

import { keepPreviousData, useQuery } from "@tanstack/react-query";

import { useAppConfig } from "@/components/providers/app-config-provider";
import { useCurrentCustomer } from "@/src/features/auth/hooks/use-current-customer";
import { WISHLIST_PAGE_SIZE, fetchWishlist, fetchWishlistProductIds } from "../api/wishlist-api";
import { wishlistKeys } from "../lib/query-keys";

/** One page of saved products, newest first. Gated on `/me` — the endpoint is customer-scoped. */
export function useWishlistQuery(page: number) {
    const { data: customer } = useCurrentCustomer();
    const { apiBaseUrl } = useAppConfig();

    return useQuery({
        queryKey: wishlistKeys.list(page),
        queryFn: () => fetchWishlist(apiBaseUrl, { skip: (page - 1) * WISHLIST_PAGE_SIZE, limit: WISHLIST_PAGE_SIZE }),
        enabled: Boolean(customer),
        // Holds the current page on screen while the next loads, so paging doesn't blank the grid.
        placeholderData: keepPreviousData
    });
}

/** The saved ids behind every heart in the storefront — one shared request, whatever the grid size. */
export function useWishlistProductIds(): number[] {
    const { data: customer } = useCurrentCustomer();
    const { apiBaseUrl } = useAppConfig();

    const { data } = useQuery({
        queryKey: wishlistKeys.productIds(),
        queryFn: () => fetchWishlistProductIds(apiBaseUrl),
        enabled: Boolean(customer),
        staleTime: 5 * 60 * 1000
    });

    // Not `data ?? []`: a disabled query still hands back what it cached, so hearts would
    // stay filled after a logout and carry into the next customer's session.
    return customer ? (data ?? []) : [];
}

export function useIsWishlisted(productId: number): boolean {
    return useWishlistProductIds().includes(productId);
}
