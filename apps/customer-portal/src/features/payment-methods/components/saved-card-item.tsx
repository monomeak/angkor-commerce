"use client";

import { CreditCard, Pencil, Trash2 } from "lucide-react";

import { cn } from "@/lib/utils";
import { CARD_BRAND_LABEL } from "../lib/card-brand";
import type { SavedCard } from "../types/payment-method";

type SavedCardItemProps = {
  readonly card: SavedCard;
  readonly selected?: boolean;
  readonly onSelect?: () => void;
  readonly onEdit?: () => void;
  readonly onRemove?: () => void;
};

export function SavedCardItem({ card, selected, onSelect, onEdit, onRemove }: SavedCardItemProps) {
  const content = (
    <div className="flex items-center gap-3">
      <CreditCard className="size-5 shrink-0 text-muted-foreground" />
      <div className="flex-1 text-sm">
        <p className="font-medium text-foreground">
          {CARD_BRAND_LABEL[card.brand]} •••• {card.last4}
        </p>
        <p className="text-muted-foreground">
          {card.cardholderName} · Expires {card.expiryMonth}/{card.expiryYear}
        </p>
      </div>
      {onEdit && (
        <button
          type="button"
          onClick={(event) => {
            event.stopPropagation();
            onEdit();
          }}
          aria-label={`Edit card ending in ${card.last4}`}
          className="shrink-0 text-muted-foreground transition-colors hover:text-foreground"
        >
          <Pencil className="size-4" />
        </button>
      )}
      {onRemove && (
        <button
          type="button"
          onClick={(event) => {
            event.stopPropagation();
            onRemove();
          }}
          aria-label={`Remove card ending in ${card.last4}`}
          className="shrink-0 text-muted-foreground transition-colors hover:text-destructive"
        >
          <Trash2 className="size-4" />
        </button>
      )}
    </div>
  );

  if (!onSelect) {
    return <div className="rounded-xl border bg-card p-4">{content}</div>;
  }

  return (
    <button
      type="button"
      onClick={onSelect}
      aria-pressed={selected}
      className={cn(
        "w-full rounded-xl border p-4 text-left transition-colors",
        selected ? "border-primary bg-primary/5" : "hover:border-primary/50",
      )}
    >
      {content}
    </button>
  );
}
