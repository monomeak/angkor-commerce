import { z } from "zod";

/**
 * Wire shapes for `/storefront/checkout`. `IntentStatus` carries no @JsonValue, so it stays
 * UPPERCASE — unlike an order's status.
 */
export const intentStatusSchema = z.enum(["CREATED", "PENDING", "SUCCEEDED", "FAILED", "EXPIRED", "CANCELLED"]);

/**
 * `qrPayload` and `deeplink` are null for the wallet provider — there is nothing external to
 * scan. They are what an ABA PayWay intent would carry instead.
 */
export const paymentIntentDtoSchema = z.object({
    reference: z.string(),
    provider: z.string(),
    amount: z.number(),
    currency: z.string(),
    status: intentStatusSchema,
    qrPayload: z.string().nullable(),
    deeplink: z.string().nullable(),
    expiresAt: z.string().nullable()
});

export const paymentStatusDtoSchema = z.object({
    reference: z.string(),
    status: intentStatusSchema,
    orderNumber: z.string().nullable(),
    /** Filled in once the payment is confirmed and the invoice exists. */
    invoiceNumber: z.string().nullable(),
    confirmedAt: z.string().nullable(),
    failureReason: z.string().nullable()
});

export type PaymentIntentDto = z.infer<typeof paymentIntentDtoSchema>;
export type PaymentStatusDto = z.infer<typeof paymentStatusDtoSchema>;
