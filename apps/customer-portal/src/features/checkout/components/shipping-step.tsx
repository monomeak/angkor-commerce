"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { MapPin, Plus } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { AddressForm } from "@/src/features/addresses/components/address-form";
import { useAddresses, useAddressesQuery, useDefaultAddress } from "@/src/features/addresses/hooks/use-addresses";
import {
    formatAddressTitle,
    formatAreaLine,
    formatStreetLine,
    MAX_SAVED_ADDRESSES
} from "@/src/features/addresses/lib/address-helpers";
import { useCurrentCustomer } from "@/src/features/auth/hooks/use-current-customer";
import { useCart } from "@/src/features/cart/lib/cart-context";
import { cn } from "@/lib/utils";

/**
 * Where the order ships, chosen rather than typed: `POST /storefront/orders` takes a
 * `shippingAddressId` from the customer's own address book and flattens that row onto the
 * order itself, so there is nothing for a free-form form to send. The address book's own
 * form is reused for adding one, map picker included.
 *
 * The choice travels to /checkout in the URL, so a refresh or a back-and-forward keeps it.
 */
export function ShippingStep() {
    const router = useRouter();
    const { items } = useCart();
    const { data: customer, isPending: isResolvingSession } = useCurrentCustomer();
    const { isPending } = useAddressesQuery();
    const addresses = useAddresses();
    const defaultAddress = useDefaultAddress();
    const [selectedId, setSelectedId] = useState<number | null>(null);
    const [isAdding, setIsAdding] = useState(false);

    const chosenId = selectedId ?? defaultAddress?.id ?? null;

    if (items.length === 0) {
        return (
            <div className="flex flex-col items-center gap-3 rounded-2xl border bg-card p-10 text-center">
                <p className="text-muted-foreground">Your cart is empty.</p>
                <Button nativeButton={false} render={<Link href="/" />}>
                    Continue shopping
                </Button>
            </div>
        );
    }

    if (isResolvingSession) {
        return <Skeleton className="h-64 w-full rounded-2xl" />;
    }

    // Orders are customer-scoped, so checkout is one of the few places anonymous browsing stops.
    if (!customer) {
        return (
            <div className="flex flex-col items-center gap-3 rounded-2xl border bg-card p-10 text-center">
                <p className="text-muted-foreground">Sign in to place your order.</p>
                <Button nativeButton={false} render={<Link href="/login?next=/shipping" />}>
                    Sign in
                </Button>
            </div>
        );
    }

    return (
        <div className="flex flex-col gap-4 rounded-2xl border bg-card p-6">
            <div>
                <h1 className="text-xl font-semibold">Where should we deliver?</h1>
                <p className="mt-1 text-sm text-muted-foreground">
                    Your order ships to one of your saved addresses.
                </p>
            </div>

            {isPending ? (
                <Skeleton className="h-24 w-full rounded-xl" />
            ) : (
                <div className="grid gap-2 sm:grid-cols-2">
                    {addresses.map((address) => (
                        <button
                            key={address.id}
                            type="button"
                            onClick={() => setSelectedId(address.id)}
                            aria-pressed={address.id === chosenId}
                            className={cn(
                                "rounded-xl border p-3 text-left text-sm transition-colors",
                                address.id === chosenId ? "border-primary" : "hover:border-primary/50"
                            )}
                        >
                            <span className="flex flex-wrap items-center gap-2 font-medium text-foreground">
                                {formatAddressTitle(address)}
                                {address.isDefault && <Badge variant="secondary">Default</Badge>}
                            </span>
                            <span className="mt-1 block text-muted-foreground">{address.recipientPhone}</span>
                            <span className="block text-muted-foreground">{formatStreetLine(address)}</span>
                            <span className="block text-muted-foreground">{formatAreaLine(address)}</span>
                        </button>
                    ))}
                </div>
            )}

            {!isPending && addresses.length === 0 && !isAdding && (
                <div className="flex flex-col items-center gap-3 py-6 text-center">
                    <MapPin className="size-10 text-muted-foreground" />
                    <p className="text-sm text-muted-foreground">No saved address yet — add one to continue.</p>
                </div>
            )}

            {isAdding ? (
                <AddressForm
                    canChooseDefault={!isPending && addresses.length > 0}
                    onSaved={() => setIsAdding(false)}
                    onCancel={() => setIsAdding(false)}
                />
            ) : (
                <Button
                    variant="outline"
                    className="w-fit"
                    disabled={!isPending && addresses.length >= MAX_SAVED_ADDRESSES}
                    onClick={() => setIsAdding(true)}
                >
                    <Plus data-icon="inline-start" className="size-4" />
                    Add address
                </Button>
            )}

            <Button
                variant="accent"
                className="w-fit"
                disabled={chosenId === null}
                onClick={() => router.push(`/checkout?addressId=${chosenId}`)}
            >
                Continue to payment
            </Button>
        </div>
    );
}
