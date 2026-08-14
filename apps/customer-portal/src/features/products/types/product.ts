/**
 * A product as the storefront's listing screens work with it — mapped from core-api's
 * ProductSummaryResponse, not the wire shape itself (that lives in ../schemas).
 *
 * Two things about the API worth knowing:
 *
 * 1. `price` is the *lowest effective* price across the product's variants, not a single
 *    product price. There is no product-level stock or SKU either — both live on variants,
 *    and the API pre-sums stock as `totalStock`.
 * 2. The list row carries no variants, only a `variantCount`. Sizes therefore belong to the
 *    detail page, which fetches GET /products/{id}; a card links there rather than offering
 *    a size it would have to invent.
 */
export interface ProductSummary {
    id: number;
    name: string;
    description: string | null;
    /** Category name, flattened by the API. Not unique — Men, Women and Children all have "Shoes". */
    categoryName: string | null;
    categoryId: number | null;
    /** What a product link is built from: /product/{categorySlug}/{id}. */
    categorySlug: string | null;
    price: number;
    currency: string;
    discountPercentage: number;
    rating: number;
    totalStock: number;
    variantCount: number;
    /** Raw MinIO object key — resolve with resolveMediaUrl() before rendering. */
    thumbnail: string | null;
}

export interface ProductListResult {
    products: ProductSummary[];
    total: number;
    skip: number;
    limit: number;
}

export interface ProductListParams {
    /** Matches name, description and variant SKU. There is no separate /search endpoint. */
    q?: string;
    /** core-api expands this to the category *and its descendants*, so "men" browses the whole subtree. */
    categorySlug?: string;
    minPrice?: number;
    maxPrice?: number;
    skip?: number;
    limit?: number;
}

/**
 * A sellable row of a product: its own SKU, stock and (optional) price.
 *
 * This is where size and stock actually live — a product has neither of its own. A product
 * always has at least one variant, because core-api's CreateProductRequest marks the list
 * @NotEmpty, but a single-variant product's `size` is usually null.
 */
export interface ProductVariant {
    id: number;
    size: string | null;
    sku: string;
    stock: number;
    /** Effective price: the API has already resolved priceOverride against the product price. */
    price: number;
    priceOverride: number | null;
}

export interface ProductImage {
    id: number;
    /** Raw MinIO object key — resolve with resolveMediaUrl() before rendering. */
    imageUrl: string;
    thumbnailUrl: string | null;
    displayOrder: number | null;
}

export interface ProductCategoryRef {
    id: number;
    name: string;
    slug: string;
}

/** A full product (GET /products/{id}) — the detail page's shape. */
export interface Product {
    id: number;
    name: string;
    description: string | null;
    category: ProductCategoryRef | null;
    /** Base price. What a shopper pays comes from the selected variant. */
    price: number;
    currency: string;
    discountPercentage: number;
    rating: number;
    unit: string | null;
    thumbnailUrl: string | null;
    images: ProductImage[];
    variants: ProductVariant[];
    /** Summed across variants by the API. */
    totalStock: number;
}

/**
 * The legacy mock shape, still used by the cart and checkout, which resolve product ids
 * against local data. New code should use Product or ProductSummary.
 */
export type MockProduct = {
    id: number;
    name: string;
    categoryId: number;
    images: string[];
    description: string;
    quantity: number;
    rating: number;
    promotionPercentage: number;
    price: number;
};
