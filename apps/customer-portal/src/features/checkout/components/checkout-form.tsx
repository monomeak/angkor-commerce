"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";

import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Skeleton } from "@/components/ui/skeleton";
import { Textarea } from "@/components/ui/textarea";
import { ApiError } from "@/lib/api-client";
import { useAddresses, useAddressesQuery, useDefaultAddress } from "@/src/features/addresses/hooks/use-addresses";
import { formatAreaLine, formatStreetLine } from "@/src/features/addresses/lib/address-helpers";
import { useCurrentCustomer } from "@/src/features/auth/hooks/use-current-customer";
import { useCart } from "@/src/features/cart/lib/cart-context";
import { hasMixedCurrencies, toOrderItems } from "@/src/features/cart/lib/cart-helpers";
import type { Order } from "@/src/features/orders/types/order";
import { WalletBalanceCard } from "@/src/features/wallet/components/wallet-balance-card";
import { usePlaceOrder } from "../hooks/use-place-order";
import { useWalletPayment } from "../hooks/use-wallet-payment";

/**
 * The payment step. Two API calls stand behind the one button, and they are deliberately not
 * collapsed into one: `POST /storefront/orders` places the order and reserves its stock, then
 * the wallet pays it. If the payment fails — a short balance is the usual reason — the order
 * survives, the cart is already emptied into it, and the button retries only the payment.
 * That is why `placedOrder` is held in state rather than the whole thing being restarted.
 */
export function CheckoutForm({ addressId }: { readonly addressId: number | null }) {
    const router = useRouter();
    const { items, subtotal, clearCart } = useCart();
    const { isPending: isLoadingAddresses } = useAddressesQuery();
    const addresses = useAddresses();
    const defaultAddress = useDefaultAddress();
    const { data: customer, isPending: isResolvingSession } = useCurrentCustomer();
    const placeOrder = usePlaceOrder();
    const payWithWallet = useWalletPayment();
    const [placedOrder, setPlacedOrder] = useState<Order | null>(null);
    const [notes, setNotes] = useState("");
    const [error, setError] = useState<string | null>(null);

    const address = addresses.find((candidate) => candidate.id === addressId) ?? defaultAddress;
    const hasNoAddress = Boolean(customer) && !isLoadingAddresses && !address;

    useEffect(() => {
        if (hasNoAddress) {
            router.replace("/shipping");
        }
    }, [hasNoAddress, router]);

    const currency = placedOrder?.currency ?? items[0]?.currency ?? "USD";
    const amountDue = placedOrder?.total ?? subtotal;
    const isBusy = placeOrder.isPending || payWithWallet.isPending;

    async function handlePlaceOrder() {
        if (!address) {
            return;
        }

        setError(null);

        try {
            let order = placedOrder;

            if (!order) {
                order = await placeOrder.mutateAsync({
                    items: toOrderItems(items),
                    shippingAddressId: address.id,
                    notes: notes.trim() || undefined
                });
                setPlacedOrder(order);
                // The lines now live on the order, which is what holds the stock.
                clearCart();
            }

            const result = await payWithWallet.mutateAsync(order.id);

            if (result.status === "SUCCEEDED") {
                router.push(`/checkout/confirmation/${order.id}`);
                return;
            }

            // A settled-but-unsuccessful intent (expired, declined) is a result, not a throw.
            setError(result.failureReason ?? "That payment didn't go through. Try again.");
        } catch (cause) {
            setError(cause instanceof ApiError ? cause.displayMessage : "Something went wrong. Please try again.");
        }
    }

    if (isResolvingSession) {
        return <Skeleton className="h-64 w-full rounded-2xl" />;
    }

    if (!customer) {
        return (
            <div className="flex flex-col items-center gap-3 rounded-2xl border bg-card p-10 text-center">
                <p className="text-muted-foreground">Sign in to place your order.</p>
                <Button nativeButton={false} render={<Link href="/login?next=/checkout" />}>
                    Sign in
                </Button>
            </div>
        );
    }

    if (items.length === 0 && !placedOrder) {
        return (
            <div className="flex flex-col items-center gap-3 rounded-2xl border bg-card p-10 text-center">
                <p className="text-muted-foreground">Your cart is empty.</p>
                <Button nativeButton={false} render={<Link href="/" />}>
                    Continue shopping
                </Button>
            </div>
        );
    }

    if (!address) {
        return <Skeleton className="h-64 w-full rounded-2xl" />;
    }

    // core-api rejects an order whose lines disagree about currency, so it is caught here
    // rather than as a 400 after the button.
    const isMixedCurrency = hasMixedCurrencies(items);

    return (
        <div className="flex flex-col gap-4">
            <div className="rounded-2xl border bg-card p-6">
                <div className="flex items-center justify-between">
                    <h2 className="font-semibold">Shipping to</h2>
                    <Link href="/shipping" className="text-sm text-primary hover:underline">
                        Change
                    </Link>
                </div>
                <div className="mt-2 text-sm text-muted-foreground">
                    <p className="text-foreground">{address.recipientName}</p>
                    <p>{address.recipientPhone}</p>
                    <p>{formatStreetLine(address)}</p>
                    <p>{formatAreaLine(address)}</p>
                </div>
            </div>

            {!placedOrder && (
                <div className="flex flex-col gap-1.5 rounded-2xl border bg-card p-6">
                    <Label htmlFor="order-notes">Delivery notes (optional)</Label>
                    <Textarea
                        id="order-notes"
                        value={notes}
                        onChange={(event) => setNotes(event.target.value)}
                        placeholder="e.g. landmark, preferred delivery time"
                        maxLength={500}
                    />
                </div>
            )}

            <div className="flex flex-col gap-3 rounded-2xl border bg-card p-6">
                <h2 className="font-semibold">Pay with your balance</h2>
                <WalletBalanceCard currency={currency} amountDue={amountDue} />
            </div>

            {placedOrder && (
                <p className="text-sm text-muted-foreground">
                    Order {placedOrder.orderNumber} is placed and waiting for payment.{" "}
                    <Link href={`/account/orders/${placedOrder.id}`} className="text-primary hover:underline">
                        View it
                    </Link>
                </p>
            )}

            {isMixedCurrency && (
                <p className="text-sm text-destructive">
                    Your cart mixes currencies. Order the items of one currency at a time.
                </p>
            )}

            {error && <p className="text-sm text-destructive">{error}</p>}

            <Button
                variant="accent"
                size="lg"
                className="w-full"
                disabled={isBusy || isMixedCurrency}
                onClick={() => void handlePlaceOrder()}
            >
                {isBusy ? "Processing…" : placedOrder ? "Retry payment" : "Place order"}
            </Button>
        </div>
    );
}
