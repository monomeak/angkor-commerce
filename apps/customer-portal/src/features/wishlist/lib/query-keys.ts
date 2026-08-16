export const wishlistKeys = {
    all: ["wishlist"] as const,
    /** One entry per page. Mutations invalidate `all` — removing an item shifts later rows up a page. */
    list: (page: number) => [...wishlistKeys.all, "list", page] as const,
    /** Cached apart from the list: a grid needs the hearts, not the saved products' details. */
    productIds: () => [...wishlistKeys.all, "product-ids"] as const
};
