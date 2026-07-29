"use client";

import { useState, type FormEvent } from "react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { detectCardBrand } from "../lib/card-brand";
import { formatCardNumber, formatDigitsOnly, formatExpiry } from "../lib/card-format";
import { addCardSchema } from "../lib/payment-methods-schemas";
import { addSavedCard } from "../lib/payment-methods-storage";
import type { SavedCard } from "../types/payment-method";

type AddCardFormProps = {
  readonly onAdded: (card: SavedCard) => void;
  readonly onCancel?: () => void;
};

export function AddCardForm({ onAdded, onCancel }: AddCardFormProps) {
  const [cardholderName, setCardholderName] = useState("");
  const [cardNumber, setCardNumber] = useState("");
  const [expiry, setExpiry] = useState("");
  const [cvc, setCvc] = useState("");
  const [error, setError] = useState<string | null>(null);

  function handleSubmit(event: FormEvent) {
    event.preventDefault();

    const result = addCardSchema.safeParse({ cardholderName, cardNumber, expiry, cvc });

    if (!result.success) {
      setError(result.error.issues[0]?.message ?? "Please check your input.");
      return;
    }

    const [expiryMonth, expiryYear] = result.data.expiry.split("/");
    const card: SavedCard = {
      id: crypto.randomUUID(),
      cardholderName: result.data.cardholderName,
      brand: detectCardBrand(result.data.cardNumber),
      last4: result.data.cardNumber.slice(-4),
      expiryMonth,
      expiryYear,
    };

    addSavedCard(card);
    setError(null);
    onAdded(card);
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4 rounded-xl border bg-card p-4">
      <div className="flex flex-col gap-1.5">
        <Label htmlFor="cardholder-name">Cardholder name</Label>
        <Input
          id="cardholder-name"
          value={cardholderName}
          onChange={(event) => setCardholderName(event.target.value)}
          required
        />
      </div>

      <div className="flex flex-col gap-1.5">
        <Label htmlFor="card-number">Card number</Label>
        <Input
          id="card-number"
          inputMode="numeric"
          placeholder="4242 4242 4242 4242"
          value={cardNumber}
          onChange={(event) => setCardNumber(formatCardNumber(event.target.value))}
          required
        />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="flex flex-col gap-1.5">
          <Label htmlFor="card-expiry">Expiry (MM/YY)</Label>
          <Input
            id="card-expiry"
            inputMode="numeric"
            placeholder="MM/YY"
            value={expiry}
            onChange={(event) => setExpiry(formatExpiry(event.target.value))}
            required
          />
        </div>
        <div className="flex flex-col gap-1.5">
          <Label htmlFor="card-cvc">CVC</Label>
          <Input
            id="card-cvc"
            inputMode="numeric"
            placeholder="123"
            value={cvc}
            onChange={(event) => setCvc(formatDigitsOnly(event.target.value, 4))}
            required
          />
        </div>
      </div>

      {error && <p className="text-sm text-destructive">{error}</p>}

      <div className="flex gap-2">
        <Button type="submit">Save card</Button>
        {onCancel && (
          <Button type="button" variant="outline" onClick={onCancel}>
            Cancel
          </Button>
        )}
      </div>
    </form>
  );
}
