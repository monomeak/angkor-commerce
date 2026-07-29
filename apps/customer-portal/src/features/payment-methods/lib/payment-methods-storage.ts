import type { SavedCard } from "../types/payment-method";

const PAYMENT_METHODS_STORAGE_KEY = "angkor-customer-payment-methods";

function isSavedCard(value: unknown): value is SavedCard {
  return (
    typeof value === "object" &&
    value !== null &&
    typeof (value as SavedCard).id === "string" &&
    typeof (value as SavedCard).last4 === "string" &&
    typeof (value as SavedCard).expiryMonth === "string" &&
    typeof (value as SavedCard).expiryYear === "string"
  );
}

export function getSavedCards(): SavedCard[] {
  try {
    const raw: unknown = JSON.parse(localStorage.getItem(PAYMENT_METHODS_STORAGE_KEY) ?? "[]");
    return Array.isArray(raw) ? raw.filter(isSavedCard) : [];
  } catch {
    return [];
  }
}

export function addSavedCard(card: SavedCard): void {
  const next = [...getSavedCards(), card];
  localStorage.setItem(PAYMENT_METHODS_STORAGE_KEY, JSON.stringify(next));
}

export function removeSavedCard(id: string): void {
  const next = getSavedCards().filter((card) => card.id !== id);
  localStorage.setItem(PAYMENT_METHODS_STORAGE_KEY, JSON.stringify(next));
}

export function updateSavedCard(
  id: string,
  updates: Pick<SavedCard, "cardholderName" | "expiryMonth" | "expiryYear">,
): void {
  const next = getSavedCards().map((card) => (card.id === id ? { ...card, ...updates } : card));
  localStorage.setItem(PAYMENT_METHODS_STORAGE_KEY, JSON.stringify(next));
}
