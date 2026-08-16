/**
 * Domain types for the catalogue. These are the shapes the UI works with — deliberately
 * not the wire DTOs, which live in ../schemas and get mapped in ../mappers.
 *
 * Two things about core-api worth knowing before reading these:
 *
 * 1. The list and detail endpoints return genuinely different shapes. The list
 *    (ProductSummaryResponse) flattens category to a name, has no description/unit/images
 *    and no createdAt; the detail (ProductResponse) nests the category, carries variants
 *    and images, and has timestamps. They are modelled separately rather than pretending
 *    one is a partial of the other.
 * 2. There is no product-level `sku` or `stock`. Both live on variants; a product's stock
 *    is the sum across its variants, which the API computes as `totalStock`.
 */

export type ProductStatus = "active" | "inactive" | "deleted";

export interface ProductVariant {
    id: number;
    /** null on single-variant products. */
    size: string | null;
    sku: string;
    stock: number;
    /** Effective price: priceOverride when set, otherwise the product's price. */
    price: number;
    /** null means "inherit the product price". */
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

/** A row in the products table (GET /products). */
export interface ProductSummary {
    id: number;
    name: string;
    /** Flattened to a bare name by the API; there is no id here, so the row cannot link by category. */
    categoryName: string | null;
    /** Lowest effective price across the product's variants. */
    price: number;
    currency: string;
    discountPercentage: number;
    rating: number;
    totalStock: number;
    variantCount: number;
    /** Raw MinIO object key. */
    thumbnail: string | null;
    status: ProductStatus;
}

/** A full product (GET /products/{id}). */
export interface Product {
    id: number;
    name: string;
    description: string | null;
    category: ProductCategoryRef | null;
    price: number;
    currency: string;
    discountPercentage: number;
    rating: number;
    unit: string | null;
    status: ProductStatus;
    thumbnailUrl: string | null;
    images: ProductImage[];
    variants: ProductVariant[];
    totalStock: number;
    createdAt: string;
    updatedAt: string;
}

export interface ProductListResult {
    products: ProductSummary[];
    total: number;
    skip: number;
    limit: number;
}

/** Whitelisted by core-api's ProductQueryParams — anything else is a 400. */
export type ProductSortField = "id" | "name" | "price" | "rating" | "createdAt" | "updatedAt";
export type SortOrder = "asc" | "desc";

export interface ProductListParams {
    q?: string;
    /**
     * The list filters by slug because that is what the URL carries; the inventory cards
     * filter by id because they already have one. core-api accepts either.
     */
    categorySlug?: string;
    categoryId?: number;
    status?: ProductStatus;
    sortBy?: ProductSortField;
    order?: SortOrder;
    skip: number;
    limit: number;
}

export interface ArchivedProduct {
    id: number;
    name: string;
    status: ProductStatus;
    isDeleted: boolean;
    deletedOn: string | null;
}
