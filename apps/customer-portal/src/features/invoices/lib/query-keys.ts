export const invoiceKeys = {
    all: ["invoices"] as const,
    /** Keyed by order, because that is how the storefront reaches a receipt. */
    forOrder: (orderId: number) => [...invoiceKeys.all, "for-order", orderId] as const
};
