"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";

import { useAppConfig } from "@/components/providers/app-config-provider";
import { orderKeys } from "@/src/features/orders/lib/query-keys";
import { walletKeys } from "@/src/features/wallet/lib/query-keys";
import { confirmWalletPayment, startPayment, WALLET_PROVIDER } from "../api/checkout-api";
import type { PaymentResult } from "../types/checkout";

/**
 * Pays an existing order from the stored balance: start the intent, then confirm it.
 *
 * Used both by checkout and by an order that is still `pending` — a payment that failed for
 * a short balance leaves the order intact, so retrying after a top-up is the same two calls.
 *
 * A rejected payment throws (402 for a short balance); a settled-but-not-successful intent
 * comes back as a result whose status is not SUCCEEDED, with the reason on it.
 */
export function useWalletPayment() {
    const queryClient = useQueryClient();
    const { apiBaseUrl } = useAppConfig();

    return useMutation<PaymentResult, unknown, number>({
        mutationFn: async (orderId) => {
            const intent = await startPayment(apiBaseUrl, orderId, WALLET_PROVIDER);

            return confirmWalletPayment(apiBaseUrl, intent.reference);
        },
        onSettled: () => {
            // The debit moves the balance and the ledger; the order becomes INVOICED.
            void queryClient.invalidateQueries({ queryKey: walletKeys.all });
            void queryClient.invalidateQueries({ queryKey: orderKeys.all });
        }
    });
}
