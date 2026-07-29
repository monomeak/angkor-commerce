"use client";

import { useEffect, useState } from "react";
import { Plus } from "lucide-react";

import { Button } from "@/components/ui/button";
import { getSavedCards } from "../lib/payment-methods-storage";
import type { SavedCard } from "../types/payment-method";
import { AddCardForm } from "./add-card-form";
import { SavedCardItem } from "./saved-card-item";

type CardSelectorProps = {
  readonly selectedCardId: string | null;
  readonly onSelect: (card: SavedCard) => void;
};

export function CardSelector({ selectedCardId, onSelect }: CardSelectorProps) {
  const [cards, setCards] = useState<SavedCard[]>([]);
  const [isAdding, setIsAdding] = useState(false);

  useEffect(() => {
    const savedCards = getSavedCards();
    setCards(savedCards);
    setIsAdding(savedCards.length === 0);
  }, []);

  function handleAdded(card: SavedCard) {
    setCards((current) => [...current, card]);
    setIsAdding(false);
    onSelect(card);
  }

  return (
    <div className="mt-4 flex flex-col gap-3">
      {cards.map((card) => (
        <SavedCardItem
          key={card.id}
          card={card}
          selected={card.id === selectedCardId}
          onSelect={() => onSelect(card)}
        />
      ))}

      {isAdding ? (
        <AddCardForm
          onAdded={handleAdded}
          onCancel={cards.length > 0 ? () => setIsAdding(false) : undefined}
        />
      ) : (
        <Button type="button" variant="outline" className="w-fit" onClick={() => setIsAdding(true)}>
          <Plus data-icon="inline-start" className="size-4" />
          Add new card
        </Button>
      )}
    </div>
  );
}
