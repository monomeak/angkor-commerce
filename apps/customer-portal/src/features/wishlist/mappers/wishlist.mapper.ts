import { DEFAULT_CURRENCY } from "@/src/features/products/mappers/product.mapper";
import type { WishlistItemDto, WishlistPageDto } from "../schemas/wishlist-api.schema";
import type { WishlistItem, WishlistPage } from "../types/wishlist";

/** Same normalisation the catalogue does — core-api leaves the aggregate-derived numbers nullable. */
export function mapWishlistItem(dto: WishlistItemDto): WishlistItem {
    return {
        id: dto.id,
        productId: dto.productId,
        title: dto.title,
        description: dto.description,
        categorySlug: dto.categorySlug,
        thumbnail: dto.thumbnail,
        price: dto.price ?? 0,
        currency: dto.currency ?? DEFAULT_CURRENCY,
        discountPercentage: dto.discountPercentage ?? 0,
        totalStock: dto.totalStock ?? 0,
        productStatus: dto.productStatus,
        savedAt: dto.createdAt
    };
}

export function mapWishlistPage(dto: WishlistPageDto): WishlistPage {
    return {
        items: dto.wishlist.map(mapWishlistItem),
        total: dto.total,
        skip: dto.skip,
        limit: dto.limit
    };
}
