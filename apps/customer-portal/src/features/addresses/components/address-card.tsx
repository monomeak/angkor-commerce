"use client";

import { useState } from "react";
import { MapPin, Pencil, Trash2 } from "lucide-react";

import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle
} from "@/components/ui/alert-dialog";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
    formatAddressTitle,
    formatAreaLine,
    formatCoordinates,
    formatStreetLine,
    toCoordinates
} from "../lib/address-helpers";
import type { CustomerAddress } from "../types/address";

type AddressCardProps = {
    readonly address: CustomerAddress;
    readonly onEdit: () => void;
    readonly onDelete: () => void;
    readonly onSetDefault: () => void;
    /** A mutation for this address is in flight — the API owns the outcome, so wait for it. */
    readonly isBusy?: boolean;
};

export function AddressCard({ address, onEdit, onDelete, onSetDefault, isBusy = false }: AddressCardProps) {
    const [isConfirmingDelete, setIsConfirmingDelete] = useState(false);
    const title = formatAddressTitle(address);
    const pin = toCoordinates(address);
    // The title already shows the recipient when the address has no label of its own.
    const recipientLine = address.label?.trim()
        ? `${address.recipientName} · ${address.recipientPhone}`
        : address.recipientPhone;

    return (
        <div className="rounded-xl border bg-card p-4">
            <div className="flex items-start gap-3">
                <MapPin className="mt-0.5 size-5 shrink-0 text-muted-foreground" />

                <div className="flex-1 text-sm">
                    <div className="flex flex-wrap items-center gap-2">
                        <p className="font-medium text-foreground">{title}</p>
                        {address.isDefault && <Badge variant="secondary">Default</Badge>}
                    </div>
                    <p className="mt-1 text-muted-foreground">{recipientLine}</p>
                    <p className="text-muted-foreground">{formatStreetLine(address)}</p>
                    <p className="text-muted-foreground">{formatAreaLine(address)}</p>
                    {pin && <p className="mt-1 text-xs text-muted-foreground">Pinned at {formatCoordinates(pin)}</p>}
                </div>

                <div className="flex shrink-0 items-center gap-1">
                    <button
                        type="button"
                        onClick={onEdit}
                        disabled={isBusy}
                        aria-label={`Edit address ${title}`}
                        className="text-muted-foreground transition-colors hover:text-foreground disabled:opacity-50"
                    >
                        <Pencil className="size-4" />
                    </button>
                    <button
                        type="button"
                        onClick={() => setIsConfirmingDelete(true)}
                        disabled={isBusy}
                        aria-label={`Delete address ${title}`}
                        className="text-muted-foreground transition-colors hover:text-destructive disabled:opacity-50"
                    >
                        <Trash2 className="size-4" />
                    </button>
                </div>
            </div>

            {!address.isDefault && (
                <Button variant="ghost" size="sm" className="mt-3 -ml-2.5" disabled={isBusy} onClick={onSetDefault}>
                    Set as default
                </Button>
            )}

            <AlertDialog open={isConfirmingDelete} onOpenChange={setIsConfirmingDelete}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Delete {title}?</AlertDialogTitle>
                        <AlertDialogDescription>
                            It disappears from your address book. Orders you already placed keep the address they were
                            shipped to.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction
                            variant="destructive"
                            onClick={() => {
                                setIsConfirmingDelete(false);
                                onDelete();
                            }}
                        >
                            Delete
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </div>
    );
}
