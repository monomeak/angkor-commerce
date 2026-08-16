import type { RecordStatus } from "@/src/features/products/types/product";

/**
 * A product the customer saved for later, mapped from core-api's WishlistItemResponse.
 *
 * Close to a `ProductSummary` but not one: no rating, no category name, no variant count.
 * `price` and `totalStock` are the same variant aggregates the catalogue grid shows, so a
 * saved product does not appear to change price.
 */
export interface WishlistItem {
    /** The wishlist row's own id. Removal goes by `productId`, not this. */
    id: number;
    productId: number;
    title: string;
    description: string | null;
    categorySlug: string | null;
    /** Raw MinIO object key — resolve with productImageSrc() before rendering. */
    thumbnail: string | null;
    price: number;
    currency: string;
    discountPercentage: number;
    totalStock: number;
    /** The product's status, not the row's: a saved product can be taken off sale or deleted. */
    productStatus: RecordStatus;
    savedAt: string;
}

export interface WishlistPage {
    items: WishlistItem[];
    total: number;
    skip: number;
    limit: number;
}

export interface WishlistListParams {
    skip?: number;
    /** The API caps this at 100. */
    limit?: number;
}
