/**
 * Orders as the storefront works with them — mapped from core-api's OrderResponse and
 * OrderSummaryResponse. An order is the request; the invoice created when payment lands is
 * the receipt (see `src/features/invoices`).
 */
export type OrderStatus = "pending" | "invoiced" | "cancelled";

export type OrderItem = {
    id: number;
    productId: number;
    variantId: number;
    sku: string;
    title: string;
    /** Resolved by the API, unlike catalogue thumbnails, which are raw object keys. */
    thumbnail: string | null;
    /** Price at the moment the order was placed; later catalogue changes never touch it. */
    unitPrice: number;
    quantity: number;
    lineTotal: number;
};

/** The address flattened onto the order at checkout, so editing the address book never rewrites history. */
export type OrderShipping = {
    fullName: string;
    phone: string;
    address: string;
    city: string;
    postalCode: string | null;
    notes: string | null;
};

export type Order = {
    id: number;
    orderNumber: string;
    status: OrderStatus;
    items: OrderItem[];
    subtotal: number;
    shippingFee: number;
    total: number;
    currency: string;
    totalItems: number;
    totalQuantity: number;
    shipping: OrderShipping;
    placedAt: string;
};

/** A list row: no items, only the counts the API pre-computes. */
export type OrderSummary = {
    id: number;
    orderNumber: string;
    status: OrderStatus;
    total: number;
    currency: string;
    totalItems: number;
    totalQuantity: number;
    placedAt: string;
};

export type OrderPage = {
    items: OrderSummary[];
    total: number;
    skip: number;
    limit: number;
};

/** Body of `POST /storefront/orders`. Prices are the server's business, so none are sent. */
export type CreateOrderPayload = {
    items: { variantId: number; quantity: number }[];
    shippingAddressId: number;
    notes?: string;
};
