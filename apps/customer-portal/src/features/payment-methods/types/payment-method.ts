export type CardBrand = "visa" | "mastercard" | "card";

export type SavedCard = {
  id: string;
  cardholderName: string;
  brand: CardBrand;
  last4: string;
  expiryMonth: string;
  expiryYear: string;
};
