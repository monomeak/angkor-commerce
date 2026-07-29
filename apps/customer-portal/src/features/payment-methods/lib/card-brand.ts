import type { CardBrand } from "../types/payment-method";

export function detectCardBrand(cardNumber: string): CardBrand {
  const digits = cardNumber.replace(/\s+/g, "");

  if (digits.startsWith("4")) {
    return "visa";
  }

  if (/^5[1-5]/.test(digits)) {
    return "mastercard";
  }

  return "card";
}

export const CARD_BRAND_LABEL: Record<CardBrand, string> = {
  visa: "Visa",
  mastercard: "Mastercard",
  card: "Card",
};
