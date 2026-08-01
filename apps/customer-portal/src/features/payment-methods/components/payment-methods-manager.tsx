"use client";

import { useEffect, useState } from "react";
import { CreditCard, Plus } from "lucide-react";

import { Button } from "@/components/ui/button";
import { getSavedCards, removeSavedCard } from "../lib/payment-methods-storage";
import type { SavedCard } from "../types/payment-method";
import { AddCardForm } from "./add-card-form";
import { EditCardForm } from "./edit-card-form";
import { SavedCardItem } from "./saved-card-item";

export function PaymentMethodsManager() {
  const [cards, setCards] = useState<SavedCard[]>([]);
  const [isAdding, setIsAdding] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);

  useEffect(() => {
    setCards(getSavedCards());
  }, []);

  function handleRemove(id: string) {
    removeSavedCard(id);
    setCards((current) => current.filter((card) => card.id !== id));
  }

  function handleAdded(card: SavedCard) {
    setCards((current) => [...current, card]);
    setIsAdding(false);
  }

  function handleSaved(card: SavedCard) {
    setCards((current) => current.map((existing) => (existing.id === card.id ? card : existing)));
    setEditingId(null);
  }

  return (
    <div className="flex flex-col gap-4">
      {cards.length === 0 && !isAdding && (
        <div className="flex flex-col items-center gap-3 py-10 text-center">
          <CreditCard className="size-10 text-muted-foreground" />
          <p className="text-account-text">No payment methods added yet.</p>
        </div>
      )}

      {cards.map((card) =>
        editingId === card.id ? (
          <EditCardForm
            key={card.id}
            card={card}
            onSaved={handleSaved}
            onCancel={() => setEditingId(null)}
          />
        ) : (
          <SavedCardItem
            key={card.id}
            card={card}
            onEdit={() => setEditingId(card.id)}
            onRemove={() => handleRemove(card.id)}
          />
        ),
      )}

      {isAdding ? (
        <AddCardForm onAdded={handleAdded} onCancel={() => setIsAdding(false)} />
      ) : (
        <Button variant="outline" className="w-fit" onClick={() => setIsAdding(true)}>
          <Plus data-icon="inline-start" className="size-4" />
          Add payment method
        </Button>
      )}
    </div>
  );
}
