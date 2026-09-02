"use client";

import { useState } from "react";

import { Button } from "@/components/ui/button";
import { ApiError } from "@/lib/api-client";
import { WalletBalanceCard } from "@/src/features/wallet/components/wallet-balance-card";
import { useWalletPayment } from "../hooks/use-wallet-payment";

type PayPendingOrderButtonProps = {
    readonly orderId: number;
    readonly amountDue: number;
    readonly currency: string;
};

/**
 * Pays an order that was placed but never settled — a payment that failed for a short
 * balance leaves exactly that. Same two calls as checkout, so nothing is charged twice: the
 * API hands back the live intent rather than minting a second one.
 */
export function PayPendingOrderButton({ orderId, amountDue, currency }: PayPendingOrderButtonProps) {
    const payWithWallet = useWalletPayment();
    const [error, setError] = useState<string | null>(null);

    function handlePay() {
        setError(null);
        payWithWallet.mutate(orderId, {
            onSuccess: (result) => {
                if (result.status !== "SUCCEEDED") {
                    setError(result.failureReason ?? "That payment didn't go through.");
                }
            },
            onError: (cause) => {
                setError(cause instanceof ApiError ? cause.displayMessage : "Could not take that payment.");
            }
        });
    }

    return (
        <div className="flex flex-col gap-3">
            <WalletBalanceCard currency={currency} amountDue={amountDue} />
            <Button variant="accent" className="w-fit" disabled={payWithWallet.isPending} onClick={handlePay}>
                {payWithWallet.isPending ? "Paying…" : "Pay with balance"}
            </Button>
            {error && <p className="text-sm text-destructive">{error}</p>}
        </div>
    );
}
