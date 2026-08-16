import { ApiError, apiFetch, parseResponse } from "@/lib/api-client";
import { mapWishlistItem, mapWishlistPage } from "../mappers/wishlist.mapper";
import {
    wishlistItemDtoSchema,
    wishlistPageDtoSchema,
    wishlistProductIdsDtoSchema
} from "../schemas/wishlist-api.schema";
import type { WishlistItem, WishlistListParams, WishlistPage } from "../types/wishlist";

/*
 * Every route here is customer-scoped — core-api reads the customer off the session and
 * never takes one in the path — so all of it 401s for an anonymous shopper. The hooks gate
 * on `useCurrentCustomer()`.
 */

const WISHLIST_BASE = "/storefront/my-wishlist";

/** Saved products per page — three rows of three on the account grid. The API's cap is 100. */
export const WISHLIST_PAGE_SIZE = 9;

export async function fetchWishlist(apiBaseUrl: string, params: WishlistListParams = {}): Promise<WishlistPage> {
    const search = new URLSearchParams({
        limit: String(params.limit ?? WISHLIST_PAGE_SIZE),
        skip: String(params.skip ?? 0)
    });

    const data = await apiFetch<unknown>(apiBaseUrl, `${WISHLIST_BASE}?${search.toString()}`);

    return mapWishlistPage(parseResponse(wishlistPageDtoSchema, data));
}

/** Just the saved ids, so a grid can fill in its hearts without paging the whole list. */
export async function fetchWishlistProductIds(apiBaseUrl: string): Promise<number[]> {
    const data = await apiFetch<unknown>(apiBaseUrl, `${WISHLIST_BASE}/product-ids`);

    return parseResponse(wishlistProductIdsDtoSchema, data);
}

/** 409 means it was already saved — two tabs, or a double tap — which is not a failure to show. */
export async function addToWishlist(apiBaseUrl: string, productId: number): Promise<WishlistItem | null> {
    try {
        const data = await apiFetch<unknown>(apiBaseUrl, WISHLIST_BASE, {
            method: "POST",
            body: JSON.stringify({ productId })
        });

        return mapWishlistItem(parseResponse(wishlistItemDtoSchema, data));
    } catch (error) {
        if (error instanceof ApiError && error.status === 409) {
            return null;
        }
        throw error;
    }
}

/** By product id, not the wishlist row's own id. A 404 means it is already gone. */
export async function removeFromWishlist(apiBaseUrl: string, productId: number): Promise<void> {
    try {
        await apiFetch<void>(apiBaseUrl, `${WISHLIST_BASE}/${productId}`, { method: "DELETE" });
    } catch (error) {
        if (error instanceof ApiError && error.status === 404) {
            return;
        }
        throw error;
    }
}

export async function clearWishlist(apiBaseUrl: string): Promise<void> {
    await apiFetch<void>(apiBaseUrl, `${WISHLIST_BASE}/all`, { method: "DELETE" });
}
