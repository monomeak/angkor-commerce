/*
 * Everything the mock catalogue needed is gone: filterProductsBy* (core-api filters now, see
 * api/product-api.ts), getSizeOptions (sizes are variant data, see lib/variants.ts) and
 * getDiscountedPrice/getProductById, which only existed to resolve cart lines against
 * products.data.ts. The cart carries its own snapshot now — see lib/cart-line.ts.
 */

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
