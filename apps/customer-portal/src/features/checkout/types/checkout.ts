export type IntentStatus = "CREATED" | "PENDING" | "SUCCEEDED" | "FAILED" | "EXPIRED" | "CANCELLED";

/** What `POST /checkout/orders/{id}/pay` hands back. For the wallet there is no QR to render. */
export type PaymentIntent = {
    reference: string;
    provider: string;
    amount: number;
    currency: string;
    status: IntentStatus;
    qrPayload: string | null;
    deeplink: string | null;
    expiresAt: string | null;
};

export type PaymentResult = {
    reference: string;
    status: IntentStatus;
    orderNumber: string | null;
    invoiceNumber: string | null;
    confirmedAt: string | null;
    failureReason: string | null;
};
