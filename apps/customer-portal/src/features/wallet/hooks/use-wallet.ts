"use client";

import { keepPreviousData, useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import { useAppConfig } from "@/components/providers/app-config-provider";
import { useCurrentCustomer } from "@/src/features/auth/hooks/use-current-customer";
import { fetchWallet, fetchWalletTransactions, seedWalletBalance } from "../api/wallet-api";
import { walletKeys } from "../lib/query-keys";

export function useWalletQuery(currency: string) {
    const { data: customer } = useCurrentCustomer();
    const { apiBaseUrl } = useAppConfig();

    return useQuery({
        queryKey: walletKeys.balance(currency),
        queryFn: () => fetchWallet(apiBaseUrl, currency),
        enabled: Boolean(customer)
    });
}

export function useWalletTransactionsQuery(currency: string, page: number) {
    const { data: customer } = useCurrentCustomer();
    const { apiBaseUrl } = useAppConfig();

    return useQuery({
        queryKey: walletKeys.transactions(currency, page),
        queryFn: () => fetchWalletTransactions(apiBaseUrl, currency, page),
        enabled: Boolean(customer),
        placeholderData: keepPreviousData
    });
}

/** Dev-only demo credit. Invalidates the whole wallet tree — the balance and the ledger both move. */
export function useSeedBalance() {
    const queryClient = useQueryClient();
    const { data: customer } = useCurrentCustomer();
    const { apiBaseUrl } = useAppConfig();

    return useMutation({
        mutationFn: ({ amount, currency }: { amount: number; currency: string }) => {
            if (!customer) {
                throw new Error("Sign in before seeding a balance");
            }
            return seedWalletBalance(apiBaseUrl, customer.id, amount, currency);
        },
        onSuccess: () => queryClient.invalidateQueries({ queryKey: walletKeys.all })
    });
}
