"use client";

import { Wallet as WalletIcon } from "lucide-react";

import { useAppConfig } from "@/components/providers/app-config-provider";
import { Skeleton } from "@/components/ui/skeleton";
import { formatPrice } from "@/src/features/products/lib/pricing";
import { useWalletQuery } from "../hooks/use-wallet";
import { SeedBalanceButton } from "./seed-balance-button";

type WalletBalanceCardProps = {
    readonly currency: string;
    /** What the balance has to cover, when it is being shown to pay something specific. */
    readonly amountDue?: number;
};

/** The stored balance, used both on the account page and as checkout's payment panel. */
export function WalletBalanceCard({ currency, amountDue }: WalletBalanceCardProps) {
    const { locale } = useAppConfig();
    const { data: wallet, isPending, isError } = useWalletQuery(currency);

    if (isPending) {
        return <Skeleton className="h-28 w-full rounded-2xl" />;
    }

    if (isError) {
        return (
            <div className="rounded-2xl border bg-card p-5">
                <p className="text-sm text-destructive">We couldn&apos;t load your balance.</p>
            </div>
        );
    }

    const isShort = amountDue !== undefined && wallet.availableBalance < amountDue;

    return (
        <div className="flex flex-col gap-3 rounded-2xl border bg-card p-5">
            <div className="flex items-start justify-between gap-3">
                <div className="flex items-center gap-2">
                    <WalletIcon className="size-5 text-muted-foreground" />
                    <div>
                        <p className="text-sm text-muted-foreground">Wallet balance</p>
                        <p className="text-2xl font-semibold">
                            {formatPrice(wallet.availableBalance, wallet.currency, locale)}
                        </p>
                    </div>
                </div>
                {wallet.status !== "ACTIVE" && (
                    <p className="text-sm text-destructive">Wallet {wallet.status.toLowerCase()}</p>
                )}
            </div>

            {isShort && (
                <p className="text-sm text-destructive">
                    That is {formatPrice(amountDue - wallet.availableBalance, wallet.currency, locale)} short of this
                    order.
                </p>
            )}

            <SeedBalanceButton currency={currency} />
        </div>
    );
}
