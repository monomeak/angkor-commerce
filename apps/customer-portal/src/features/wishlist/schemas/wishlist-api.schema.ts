import { z } from "zod";

import { recordStatusSchema } from "@/src/features/products/schemas/product-api.schema";

/**
 * Wire shapes for `/storefront/my-wishlist`, exactly as core-api serialises them. The product
 * is flattened onto the row, matching the API's convention for line items.
 */
export const wishlistItemDtoSchema = z.object({
    id: z.number(),
    productId: z.number(),
    title: z.string(),
    description: z.string().nullable(),
    categorySlug: z.string().nullable(),
    thumbnail: z.string().nullable(),
    price: z.number().nullable(),
    currency: z.string().nullable(),
    discountPercentage: z.number().nullable(),
    /** Null when the product has no variants, so no aggregate row. */
    totalStock: z.number().nullable(),
    productStatus: recordStatusSchema,
    createdAt: z.string()
});

/** PageResponse<T> names the rows after the resource, so the envelope key is `wishlist`. */
export const wishlistPageDtoSchema = z.object({
    wishlist: z.array(wishlistItemDtoSchema),
    total: z.number(),
    skip: z.number(),
    limit: z.number()
});

/** `GET /storefront/my-wishlist/product-ids` — a bare array, no envelope. */
export const wishlistProductIdsDtoSchema = z.array(z.number());

export type WishlistItemDto = z.infer<typeof wishlistItemDtoSchema>;
export type WishlistPageDto = z.infer<typeof wishlistPageDtoSchema>;
