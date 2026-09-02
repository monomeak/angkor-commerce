import type { WalletTxnType } from "../types/wallet";

export const WALLET_TXN_LABEL: Record<WalletTxnType, string> = {
    TOPUP: "Top-up",
    PURCHASE: "Order payment",
    REFUND: "Refund",
    ADJUSTMENT: "Adjustment",
    REVERSAL: "Reversal",
    SEED: "Demo credit"
};

/** Default demo credit, in the wallet's currency. Enough for a few orders of the seeded catalogue. */
export const DEFAULT_SEED_AMOUNT = 100;

export function transactionsHref(page: number): string {
    return page <= 1 ? "/account/transactions" : `/account/transactions?page=${page}`;
}
