import type { InvoiceStatus, PaymentMethod } from "../types/invoice";

export const INVOICE_STATUS_LABEL: Record<InvoiceStatus, string> = {
    ISSUED: "Awaiting payment",
    PARTIALLY_PAID: "Partly paid",
    PAID: "Paid",
    CANCELLED: "Cancelled"
};

/**
 * The wallet gateway reports OTHER rather than QR_CODE — paying from a stored balance calls
 * for no payment instrument at all — so it is labelled from the reference instead.
 */
export const PAYMENT_METHOD_LABEL: Record<PaymentMethod, string> = {
    CASH: "Cash",
    BANK_TRANSFER: "Bank transfer",
    QR_CODE: "KHQR",
    CARD: "Card",
    OTHER: "Wallet balance"
};
