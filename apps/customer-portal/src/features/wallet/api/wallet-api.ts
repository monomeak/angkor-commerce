import { apiFetch, parseResponse } from "@/lib/api-client";
import { mapWallet, mapWalletTransactionPage } from "../mappers/wallet.mapper";
import { walletDtoSchema, walletTransactionPageDtoSchema } from "../schemas/wallet-api.schema";
import type { Wallet, WalletTransactionPage } from "../types/wallet";

const WALLET_BASE = "/storefront/wallet";

/**
 * Wallets are per currency, and core-api defaults the parameter to USD. Orders are priced in
 * the product's currency, so checkout asks for the wallet matching the cart rather than
 * assuming the shop's display currency.
 */
export async function fetchWallet(apiBaseUrl: string, currency: string): Promise<Wallet> {
    const data = await apiFetch<unknown>(apiBaseUrl, `${WALLET_BASE}?currency=${currency}`);

    return mapWallet(parseResponse(walletDtoSchema, data));
}

export const WALLET_TRANSACTIONS_PAGE_SIZE = 15;

export async function fetchWalletTransactions(
    apiBaseUrl: string,
    currency: string,
    page: number
): Promise<WalletTransactionPage> {
    const search = new URLSearchParams({
        currency,
        limit: String(WALLET_TRANSACTIONS_PAGE_SIZE),
        skip: String((page - 1) * WALLET_TRANSACTIONS_PAGE_SIZE)
    });

    const data = await apiFetch<unknown>(apiBaseUrl, `${WALLET_BASE}/transactions?${search.toString()}`);

    return mapWalletTransactionPage(parseResponse(walletTransactionPageDtoSchema, data));
}

/**
 * Demo money. `/api/v1/dev/**` is permitAll and only registered outside the prod profile
 * (`WalletSeedController`, gated on `angkor.wallet.seed.enabled`), which is why this is the
 * one storefront call that takes a customer id in its body instead of reading the session.
 * The UI is gated on `AppConfig.environment` for the same reason.
 */
export async function seedWalletBalance(
    apiBaseUrl: string,
    customerId: number,
    amount: number,
    currency: string
): Promise<void> {
    await apiFetch<unknown>(apiBaseUrl, "/dev/wallet/seed", {
        method: "POST",
        body: JSON.stringify({ customerId, amount, currency })
    });
}
