import { apiFetch, parseResponse } from "@/lib/api-client";
import { paymentIntentDtoSchema, paymentStatusDtoSchema } from "../schemas/checkout-api.schema";
import type { PaymentIntent, PaymentResult } from "../types/checkout";

/*
 * Paying is two calls, not one, because every provider goes through the same intent:
 * `/pay` creates it (for ABA that is when the QR is minted), and a second call settles it.
 * The wallet's settle step is `/wallet-confirm`, which debits the ledger and then runs the
 * same verify-and-process path a gateway pushback would.
 */

const CHECKOUT_BASE = "/storefront/checkout";

/** The wallet gateway's provider code (`WalletPaymentGatewayAdapter.PROVIDER`). */
export const WALLET_PROVIDER = "WALLET";

/**
 * Idempotent per order: a live, unexpired intent is returned again rather than a second one
 * being created, so a refreshed checkout page does not strand a payment.
 */
export async function startPayment(apiBaseUrl: string, orderId: number, provider: string): Promise<PaymentIntent> {
    const data = await apiFetch<unknown>(apiBaseUrl, `${CHECKOUT_BASE}/orders/${orderId}/pay`, {
        method: "POST",
        body: JSON.stringify({ provider })
    });

    return parseResponse(paymentIntentDtoSchema, data);
}

/**
 * Debits the balance and settles the intent — this is what creates the invoice and moves the
 * order to INVOICED. Answers 402 when the balance is short, and nothing is debited.
 */
export async function confirmWalletPayment(apiBaseUrl: string, reference: string): Promise<PaymentResult> {
    const data = await apiFetch<unknown>(apiBaseUrl, `${CHECKOUT_BASE}/payments/${reference}/wallet-confirm`, {
        method: "POST"
    });

    return parseResponse(paymentStatusDtoSchema, data);
}

export async function fetchPaymentStatus(apiBaseUrl: string, reference: string): Promise<PaymentResult> {
    const data = await apiFetch<unknown>(apiBaseUrl, `${CHECKOUT_BASE}/payment/${reference}`);

    return parseResponse(paymentStatusDtoSchema, data);
}
