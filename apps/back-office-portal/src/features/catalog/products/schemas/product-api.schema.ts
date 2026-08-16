import { z } from "zod";

/**
 * Wire shapes exactly as core-api serialises them. Kept separate from the domain types so a
 * backend change surfaces here as a schema failure rather than as undefined deep in a component.
 *
 * Money and percentages are BigDecimal on the Java side and arrive as JSON numbers
 * (5.0000 parses to 5). They are validated as numbers and never re-parsed from strings.
 */

export const recordStatusSchema = z.enum(["active", "inactive", "deleted"]);

export const productVariantDtoSchema = z.object({
    id: z.number(),
    size: z.string().nullable(),
    sku: z.string(),
    stock: z.number(),
    price: z.number(),
    priceOverride: z.number().nullable()
});

export const productImageDtoSchema = z.object({
    id: z.number(),
    imageUrl: z.string(),
    thumbnailUrl: z.string().nullable(),
    displayOrder: z.number().nullable()
});

export const productCategoryDtoSchema = z.object({
    id: z.number(),
    name: z.string(),
    slug: z.string()
});

/** ProductSummaryResponse — the list row. */
export const productSummaryDtoSchema = z.object({
    id: z.number(),
    name: z.string(),
    category: z.string().nullable(),
    price: z.number().nullable(),
    currency: z.string().nullable(),
    discountPercentage: z.number().nullable(),
    rating: z.number().nullable(),
    totalStock: z.number().nullable(),
    variantCount: z.number().nullable(),
    thumbnail: z.string().nullable(),
    status: recordStatusSchema
});

/**
 * PageResponse<T> puts the rows under a key named after the resource (via @JsonAnyGetter),
 * so the envelope is { products: [...], total, skip, limit } rather than a generic `items`.
 */
export const productListDtoSchema = z.object({
    products: z.array(productSummaryDtoSchema),
    total: z.number(),
    skip: z.number(),
    limit: z.number()
});

/** ProductResponse — the full record. */
export const productDtoSchema = z.object({
    id: z.number(),
    name: z.string(),
    description: z.string().nullable(),
    category: productCategoryDtoSchema.nullable(),
    price: z.number(),
    currency: z.string().nullable(),
    discountPercentage: z.number().nullable(),
    rating: z.number().nullable(),
    unit: z.string().nullable(),
    status: recordStatusSchema,
    thumbnailUrl: z.string().nullable(),
    images: z.array(productImageDtoSchema),
    variants: z.array(productVariantDtoSchema),
    totalStock: z.number().nullable(),
    createdAt: z.string(),
    updatedAt: z.string()
});

/** ProductDeleteResponse — returned by the soft delete. */
export const productDeleteDtoSchema = z.object({
    id: z.number(),
    name: z.string(),
    status: recordStatusSchema,
    isDeleted: z.boolean(),
    deletedOn: z.string().nullable()
});

export type ProductSummaryDto = z.infer<typeof productSummaryDtoSchema>;
export type ProductDto = z.infer<typeof productDtoSchema>;
export type ProductListDto = z.infer<typeof productListDtoSchema>;
export type ProductVariantDto = z.infer<typeof productVariantDtoSchema>;
export type ProductDeleteDto = z.infer<typeof productDeleteDtoSchema>;
