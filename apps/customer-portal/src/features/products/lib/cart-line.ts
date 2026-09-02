import type { CartLineInput } from "@/src/features/cart/types/cart";
import { applyDiscount } from "./pricing";
import type { Product, ProductVariant } from "../types/product";
import { variantLabel } from "./variants";

/**
 * The snapshot a cart line keeps for display. `unitPrice` is the variant's effective price
 * with the product discount applied — the same number the detail page shows — but core-api
 * recomputes it from the variant at order time, so a stale one costs nothing but a surprise.
 */
export function toCartLine(product: Product, variant: ProductVariant): CartLineInput {
    return {
        productId: product.id,
        variantId: variant.id,
        name: product.name,
        size: variantLabel(variant),
        sku: variant.sku,
        unitPrice: applyDiscount(variant.price, product.discountPercentage),
        currency: product.currency,
        thumbnail: product.thumbnailUrl ?? product.images[0]?.imageUrl ?? null,
        categorySlug: product.category?.slug ?? null
    };
}
