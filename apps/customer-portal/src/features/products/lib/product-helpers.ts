import { applyDiscount } from "./pricing";
import type { MockProduct } from "../types/product";

/*
 * What is left for the cart and checkout, which still resolve product ids against local
 * data. Two sets of helpers are gone from here:
 *
 * - filterProductsBy*, which only existed to fake the listing endpoint in memory. core-api
 *   filters now — see api/product-api.ts.
 * - getSizeOptions, which guessed sizes from the category name. Sizes are variant data and
 *   come from GET /products/{id} — see lib/variants.ts.
 */

/** Mock-shape products spell the discount `promotionPercentage`; the API says discountPercentage. */
export function getDiscountedPrice(product: MockProduct): number {
    return applyDiscount(product.price, product.promotionPercentage);
}

export function getProductById(products: MockProduct[], id: number): MockProduct | undefined {
    return products.find((product) => product.id === id);
}

/**
 * Where a product card links. The detail route is `/product/{categorySlug}/{productId}` —
 * the slug is what makes the URL readable and unambiguous, since category names repeat
 * across the tree ("Shoes" exists under Men, Women and Children).
 *
 * Returns undefined for a product whose category the API left null, so a caller can disable
 * the link rather than route to `/product/null/12`.
 */
export function productDetailHref(categorySlug: string | null | undefined, productId: number): string | undefined {
    return categorySlug ? `/product/${categorySlug}/${productId}` : undefined;
}
