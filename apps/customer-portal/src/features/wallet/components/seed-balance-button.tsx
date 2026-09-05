"use client";

import { useState } from "react";
import { Sparkles } from "lucide-react";

import { useAppConfig } from "@/components/providers/app-config-provider";
import { Button } from "@/components/ui/button";
import { ApiError } from "@/lib/api-client";
import { formatPrice } from "@/src/features/products/lib/pricing";
import { useSeedBalance } from "../hooks/use-wallet";
import { DEFAULT_SEED_AMOUNT } from "../lib/wallet-helpers";

/**
 * Demo money, so the whole checkout can be walked through without a payment gateway.
 *
 * Renders nothing in production: `/api/v1/dev/**` is only registered outside the prod profile,
 * so the button would 404 there. It is a development affordance, not a top-up feature — real
 * top-ups are staff-side (`POST /api/v1/wallets/{customerId}/top-up`).
 */
export function SeedBalanceButton({ currency, amount = DEFAULT_SEED_AMOUNT }: SeedBalanceButtonProps) {
    const { environment, locale } = useAppConfig();
    const seedBalance = useSeedBalance();
    const [error, setError] = useState<string | null>(null);

    if (environment === "production") {
        return null;
    }

    function handleSeed() {
        setError(null);
        seedBalance.mutate(
            { amount, currency },
            {
                onError: (cause) => {
                    setError(cause instanceof ApiError ? cause.displayMessage : "Could not add a demo balance.");
                }
            }
        );
    }

    return (
        <div className="flex flex-col gap-1">
            <Button variant="outline" size="sm" className="w-fit" disabled={seedBalance.isPending} onClick={handleSeed}>
                <Sparkles data-icon="inline-start" className="size-4" />
                {seedBalance.isPending ? "Adding…" : `Add ${formatPrice(amount, currency, locale)} demo balance`}
            </Button>
            {error && <p className="text-xs text-destructive">{error}</p>}
        </div>
    );
}

type SeedBalanceButtonProps = {
    readonly currency: string;
    readonly amount?: number;
};
