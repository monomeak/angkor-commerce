"use client";

import { useState } from "react";
import { MapPin, Plus } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { ApiError } from "@/lib/api-client";
import { useDeleteAddress, useSetDefaultAddress } from "../hooks/use-address-mutations";
import { useAddressesQuery } from "../hooks/use-addresses";
import { MAX_SAVED_ADDRESSES } from "../lib/address-helpers";
import { AddressCard } from "./address-card";
import { AddressForm } from "./address-form";

/**
 * The customer's saved addresses, straight from `/storefront/addresses`. Adding and editing
 * happen inline — the same pattern the payment methods list uses — so the list stays the one
 * place addresses are managed.
 */
export function AddressBook() {
    const { data: addresses, isPending, isError, isFetching, refetch } = useAddressesQuery();
    const deleteAddress = useDeleteAddress();
    const setDefaultAddress = useSetDefaultAddress();
    const [isAdding, setIsAdding] = useState(false);
    const [editingId, setEditingId] = useState<number | null>(null);
    const [error, setError] = useState<string | null>(null);

    /** Only the row being changed freezes, rather than the whole list. */
    function busyAddressId(): number | null {
        if (deleteAddress.isPending) {
            return deleteAddress.variables ?? null;
        }
        if (setDefaultAddress.isPending) {
            return setDefaultAddress.variables ?? null;
        }
        return null;
    }

    function reportError(fallback: string) {
        return (cause: unknown) => {
            setError(cause instanceof ApiError ? cause.displayMessage : fallback);
        };
    }

    function handleDelete(addressId: number) {
        setError(null);
        deleteAddress.mutate(addressId, { onError: reportError("Could not delete that address.") });
    }

    function handleSetDefault(addressId: number) {
        setError(null);
        setDefaultAddress.mutate(addressId, { onError: reportError("Could not change your default address.") });
    }

    if (isPending) {
        return (
            <div className="flex flex-col gap-3">
                <Skeleton className="h-28 w-full" />
                <Skeleton className="h-28 w-full" />
            </div>
        );
    }

    if (isError) {
        return (
            <div className="flex flex-col items-start gap-3">
                <p className="text-sm text-destructive">We couldn&apos;t load your saved addresses.</p>
                <Button variant="outline" disabled={isFetching} onClick={() => void refetch()}>
                    {isFetching ? "Retrying…" : "Try again"}
                </Button>
            </div>
        );
    }

    const isAtLimit = addresses.length >= MAX_SAVED_ADDRESSES;

    return (
        <div className="flex flex-col gap-4">
            {addresses.length === 0 && !isAdding && (
                <div className="flex flex-col items-center gap-3 py-10 text-center">
                    <MapPin className="size-10 text-muted-foreground" />
                    <p className="text-account-text">No shipping address saved yet.</p>
                </div>
            )}

            {addresses.map((address) =>
                editingId === address.id ? (
                    <AddressForm
                        key={address.id}
                        address={address}
                        onSaved={() => setEditingId(null)}
                        onCancel={() => setEditingId(null)}
                    />
                ) : (
                    <AddressCard
                        key={address.id}
                        address={address}
                        isBusy={busyAddressId() === address.id}
                        onEdit={() => {
                            setError(null);
                            setEditingId(address.id);
                        }}
                        onDelete={() => handleDelete(address.id)}
                        onSetDefault={() => handleSetDefault(address.id)}
                    />
                )
            )}

            {error && <p className="text-sm text-destructive">{error}</p>}

            {editingId === null &&
                (isAdding ? (
                    <AddressForm
                        canChooseDefault={addresses.length > 0}
                        onSaved={() => setIsAdding(false)}
                        onCancel={() => setIsAdding(false)}
                    />
                ) : (
                    <div className="flex flex-col gap-2">
                        <Button
                            variant="outline"
                            className="w-fit"
                            disabled={isAtLimit}
                            onClick={() => {
                                setError(null);
                                setIsAdding(true);
                            }}
                        >
                            <Plus data-icon="inline-start" className="size-4" />
                            Add address
                        </Button>
                        {isAtLimit && (
                            <p className="text-xs text-muted-foreground">
                                You can save up to {MAX_SAVED_ADDRESSES} addresses. Delete one to add another.
                            </p>
                        )}
                    </div>
                ))}
        </div>
    );
}
