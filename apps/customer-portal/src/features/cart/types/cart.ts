/**
 * A cart line, as it is stored in the browser.
 *
 * The unit of sale is the **variant** — it owns the SKU, the stock and the price — so lines
 * are keyed by `variantId`, not by product and size string.
 *
 * Everything below `quantity` is a snapshot taken when the line was added, kept so the cart
 * sheet and the checkout summary render without refetching a product per line. It is display
 * only: `POST /storefront/orders` sends nothing but variant ids and quantities, and core-api
 * reprices every line from the variant it looks up.
 */
export type CartItem = {
    productId: number;
    variantId: number;
    quantity: number;
    name: string;
    /** The variant's size, or "One size" for a product sold in a single form. */
    size: string;
    sku: string;
    /** Effective variant price with the product discount already applied. */
    unitPrice: number;
    currency: string;
    /** MinIO object key — resolve with productImageSrc() before rendering. */
    thumbnail: string | null;
    /** A product link is /product/{categorySlug}/{productId}. */
    categorySlug: string | null;
};

/** What a product page hands to `addItem` — the line without its quantity. */
export type CartLineInput = Omit<CartItem, "quantity">;
