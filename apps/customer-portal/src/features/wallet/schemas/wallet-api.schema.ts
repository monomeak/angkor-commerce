import { z } from "zod";

/**
 * Wire shapes for `/storefront/wallet`. None of these enums carry @JsonValue, so they stay
 * UPPERCASE; `currency` is a java.util.Currency, which serialises as its code ("USD").
 */
export const walletStatusSchema = z.enum(["ACTIVE", "FROZEN", "CLOSED"]);
export const walletTxnTypeSchema = z.enum(["TOPUP", "PURCHASE", "REFUND", "ADJUSTMENT", "REVERSAL", "SEED"]);
export const txnDirectionSchema = z.enum(["CREDIT", "DEBIT"]);

/**
 * A customer who has never transacted has no wallet row, and the API answers with
 * `WalletResponse.empty` — a zero balance with a null id and no timestamps, not a 404.
 */
export const walletDtoSchema = z.object({
    id: z.number().nullable(),
    customerId: z.number(),
    currency: z.string(),
    balance: z.number(),
    heldAmount: z.number(),
    availableBalance: z.number(),
    status: walletStatusSchema,
    lastTransactionAt: z.string().nullable(),
    createdAt: z.string().nullable(),
    updatedAt: z.string().nullable()
});

export const walletTransactionDtoSchema = z.object({
    id: z.number(),
    type: walletTxnTypeSchema,
    direction: txnDirectionSchema,
    /** Always positive — `direction` carries the sign. */
    amount: z.number(),
    currency: z.string(),
    balanceAfter: z.number(),
    orderId: z.number().nullable(),
    paymentIntentId: z.number().nullable(),
    reversedTransactionId: z.number().nullable(),
    description: z.string().nullable(),
    createdBy: z.unknown().nullable(),
    createdAt: z.string()
});

export const walletTransactionPageDtoSchema = z.object({
    transactions: z.array(walletTransactionDtoSchema),
    total: z.number(),
    skip: z.number(),
    limit: z.number()
});

export type WalletDto = z.infer<typeof walletDtoSchema>;
export type WalletTransactionDto = z.infer<typeof walletTransactionDtoSchema>;
export type WalletTransactionPageDto = z.infer<typeof walletTransactionPageDtoSchema>;
