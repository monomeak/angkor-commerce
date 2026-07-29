"use client";

import { useState, type FormEvent } from "react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { formatExpiry } from "../lib/card-format";
import { editCardSchema } from "../lib/payment-methods-schemas";
import { updateSavedCard } from "../lib/payment-methods-storage";
import type { SavedCard } from "../types/payment-method";

type EditCardFormProps = {
  readonly card: SavedCard;
  readonly onSaved: (card: SavedCard) => void;
  readonly onCancel: () => void;
};

export function EditCardForm({ card, onSaved, onCancel }: EditCardFormProps) {
  const [cardholderName, setCardholderName] = useState(card.cardholderName);
  const [expiry, setExpiry] = useState(`${card.expiryMonth}/${card.expiryYear}`);
  const [error, setError] = useState<string | null>(null);

  function handleSubmit(event: FormEvent) {
    event.preventDefault();

    const result = editCardSchema.safeParse({ cardholderName, expiry });

    if (!result.success) {
      setError(result.error.issues[0]?.message ?? "Please check your input.");
      return;
    }

    const [expiryMonth, expiryYear] = result.data.expiry.split("/");
    const updates = {
      cardholderName: result.data.cardholderName,
      expiryMonth,
      expiryYear,
    };

    updateSavedCard(card.id, updates);
    setError(null);
    onSaved({ ...card, ...updates });
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4 rounded-xl border bg-card p-4">
      <p className="text-sm text-muted-foreground">
        Card ending in {card.last4} — the number can&apos;t be changed; remove and add a new card
        instead.
      </p>

      <div className="flex flex-col gap-1.5">
        <Label htmlFor={`edit-cardholder-${card.id}`}>Cardholder name</Label>
        <Input
          id={`edit-cardholder-${card.id}`}
          value={cardholderName}
          onChange={(event) => setCardholderName(event.target.value)}
          required
        />
      </div>

      <div className="flex flex-col gap-1.5">
        <Label htmlFor={`edit-expiry-${card.id}`}>Expiry (MM/YY)</Label>
        <Input
          id={`edit-expiry-${card.id}`}
          inputMode="numeric"
          placeholder="MM/YY"
          value={expiry}
          onChange={(event) => setExpiry(formatExpiry(event.target.value))}
          required
        />
      </div>

      {error && <p className="text-sm text-destructive">{error}</p>}

      <div className="flex gap-2">
        <Button type="submit">Save changes</Button>
        <Button type="button" variant="outline" onClick={onCancel}>
          Cancel
        </Button>
      </div>
    </form>
  );
}
