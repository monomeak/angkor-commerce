import type { ProductVariant } from "../types/product";

/**
 * What a size button reads when the variant has no size of its own. core-api leaves `size`
 * null on a product sold in one form, and the cart keys its lines by size string, so this
 * needs a stable label rather than an empty one.
 */
export const SINGLE_VARIANT_LABEL = "One size";

export function variantLabel(variant: ProductVariant | undefined): string {
    return variant?.size ?? SINGLE_VARIANT_LABEL;
}

/**
 * The variant to preselect: the first one a shopper can actually buy. Landing on a
 * sold-out size when another is in stock reads as the whole product being unavailable.
 * Falls back to the first variant so a fully sold-out product still renders.
 */
export function pickDefaultVariant(variants: ProductVariant[]): ProductVariant | undefined {
    return variants.find((variant) => variant.stock > 0) ?? variants[0];
}
