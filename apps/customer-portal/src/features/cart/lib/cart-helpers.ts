import type { CartItem } from "../types/cart";

/** What the lines add up to. Indicative only — the order's real subtotal comes back from the API. */
export function cartSubtotal(items: readonly CartItem[]): number {
    return items.reduce((sum, item) => sum + item.unitPrice * item.quantity, 0);
}

export function cartItemCount(items: readonly CartItem[]): number {
    return items.reduce((sum, item) => sum + item.quantity, 0);
}

/** The only part of a cart line core-api is told about. */
export function toOrderItems(items: readonly CartItem[]): { variantId: number; quantity: number }[] {
    return items.map((item) => ({ variantId: item.variantId, quantity: item.quantity }));
}

/** Cart currencies are per product, and core-api rejects an order that mixes them. */
export function hasMixedCurrencies(items: readonly CartItem[]): boolean {
    return new Set(items.map((item) => item.currency)).size > 1;
}
