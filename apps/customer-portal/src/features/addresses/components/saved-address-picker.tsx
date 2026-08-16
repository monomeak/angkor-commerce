"use client";

import { Badge } from "@/components/ui/badge";
import { formatAddressTitle, formatAreaLine, formatStreetLine } from "../lib/address-helpers";
import type { CustomerAddress } from "../types/address";

type SavedAddressPickerProps = {
    readonly addresses: readonly CustomerAddress[];
    readonly onSelect: (address: CustomerAddress) => void;
};

/**
 * Fills a shipping form from the address book. Deliberately not a selection control: what it
 * writes stays editable afterwards, and checkout still submits whatever is in the fields.
 */
export function SavedAddressPicker({ addresses, onSelect }: SavedAddressPickerProps) {
    if (addresses.length === 0) {
        return null;
    }

    return (
        <div className="flex flex-col gap-2">
            <p className="text-sm font-medium text-foreground">Use a saved address</p>
            <div className="grid gap-2 sm:grid-cols-2">
                {addresses.map((address) => (
                    <button
                        key={address.id}
                        type="button"
                        onClick={() => onSelect(address)}
                        className="rounded-xl border p-3 text-left text-sm transition-colors hover:border-primary/50"
                    >
                        <span className="flex flex-wrap items-center gap-2 font-medium text-foreground">
                            {formatAddressTitle(address)}
                            {address.isDefault && <Badge variant="secondary">Default</Badge>}
                        </span>
                        <span className="mt-1 block text-muted-foreground">{formatStreetLine(address)}</span>
                        <span className="block text-muted-foreground">{formatAreaLine(address)}</span>
                    </button>
                ))}
            </div>
        </div>
    );
}
