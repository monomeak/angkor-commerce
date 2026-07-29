import type { ShippingAddress } from "@/src/features/orders/types/order";

const SHIPPING_DRAFT_STORAGE_KEY = "angkor-customer-shipping-draft";

function isShippingAddress(value: unknown): value is ShippingAddress {
  return (
    typeof value === "object" &&
    value !== null &&
    typeof (value as ShippingAddress).fullName === "string" &&
    typeof (value as ShippingAddress).phone === "string" &&
    typeof (value as ShippingAddress).address === "string" &&
    typeof (value as ShippingAddress).city === "string"
  );
}

export function getShippingDraft(): ShippingAddress | null {
  try {
    const raw: unknown = JSON.parse(localStorage.getItem(SHIPPING_DRAFT_STORAGE_KEY) ?? "null");
    return isShippingAddress(raw) ? raw : null;
  } catch {
    return null;
  }
}

export function saveShippingDraft(address: ShippingAddress): void {
  localStorage.setItem(SHIPPING_DRAFT_STORAGE_KEY, JSON.stringify(address));
}

export function clearShippingDraft(): void {
  localStorage.removeItem(SHIPPING_DRAFT_STORAGE_KEY);
}
