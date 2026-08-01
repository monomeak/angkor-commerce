export const SHIPPING_FEE = 2.5;

export function generateOrderNumber(): string {
  return `ORD-${Date.now().toString(36).toUpperCase()}`;
}
