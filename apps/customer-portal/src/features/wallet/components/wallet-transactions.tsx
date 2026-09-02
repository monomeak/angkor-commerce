"use client";

import Link from "next/link";
import { Receipt } from "lucide-react";

import { useAppConfig } from "@/components/providers/app-config-provider";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { formatDateTime } from "@/lib/date";
import { ProductPagination } from "@/src/features/products/components/product-pagination";
import { formatPrice } from "@/src/features/products/lib/pricing";
import { WALLET_TRANSACTIONS_PAGE_SIZE } from "../api/wallet-api";
import { useWalletTransactionsQuery } from "../hooks/use-wallet";
import { transactionsHref, WALLET_TXN_LABEL } from "../lib/wallet-helpers";

type WalletTransactionsProps = {
    readonly currency: string;
    readonly page: number;
};

/** The ledger behind the balance: one row per movement, newest first, as core-api stores them. */
export function WalletTransactions({ currency, page }: WalletTransactionsProps) {
    const { locale, timezone } = useAppConfig();
    const { data, isPending, isError, isFetching, refetch } = useWalletTransactionsQuery(currency, page);

    if (isPending) {
        return (
            <div className="flex flex-col gap-2">
                {Array.from({ length: 4 }).map((_, index) => (
                    <Skeleton key={index} className="h-16 w-full rounded-xl" />
                ))}
            </div>
        );
    }

    if (isError) {
        return (
            <div className="flex flex-col items-start gap-3">
                <p className="text-sm text-destructive">We couldn&apos;t load your transactions.</p>
                <Button variant="outline" disabled={isFetching} onClick={() => void refetch()}>
                    {isFetching ? "Retrying…" : "Try again"}
                </Button>
            </div>
        );
    }

    if (data.items.length === 0) {
        return (
            <div className="flex flex-col items-center gap-3 py-10 text-center">
                <Receipt className="size-10 text-muted-foreground" />
                <p className="text-account-text">No wallet activity yet.</p>
            </div>
        );
    }

    const totalPages = Math.max(1, Math.ceil(data.total / WALLET_TRANSACTIONS_PAGE_SIZE));

    return (
        <div className="flex flex-col gap-3">
            <ul className="flex flex-col gap-2">
                {data.items.map((txn) => {
                    const isDebit = txn.direction === "DEBIT";

                    return (
                        <li
                            key={txn.id}
                            className="flex flex-wrap items-center justify-between gap-3 rounded-xl border p-4"
                        >
                            <div>
                                <p className="text-sm font-medium">{WALLET_TXN_LABEL[txn.type]}</p>
                                <p className="text-xs text-muted-foreground">
                                    {formatDateTime(txn.createdAt, locale, timezone)}
                                    {txn.description ? ` · ${txn.description}` : ""}
                                </p>
                                {txn.orderId && (
                                    <Link
                                        href={`/account/orders/${txn.orderId}`}
                                        className="text-xs text-primary hover:underline"
                                    >
                                        View order
                                    </Link>
                                )}
                            </div>
                            <div className="text-right">
                                <p
                                    className={
                                        isDebit ? "text-sm font-semibold" : "text-sm font-semibold text-emerald-600"
                                    }
                                >
                                    {isDebit ? "−" : "+"} {formatPrice(txn.amount, txn.currency, locale)}
                                </p>
                                <p className="text-xs text-muted-foreground">
                                    Balance {formatPrice(txn.balanceAfter, txn.currency, locale)}
                                </p>
                            </div>
                        </li>
                    );
                })}
            </ul>

            {totalPages > 1 && (
                <ProductPagination
                    currentPage={Math.min(page, totalPages)}
                    totalPages={totalPages}
                    buildHref={transactionsHref}
                />
            )}
        </div>
    );
}
