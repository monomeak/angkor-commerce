package com.angkor.commerce.payment.intent;

public enum IntentStatus {
    CREATED, // row exists; PayWay not yet asked (or the call is in flight)
    PENDING, // customer has the QR on screen
    SUCCEEDED, // money confirmed by check-transaction
    FAILED, // declined, or something went wrong
    EXPIRED, // QR lifetime ran out
    CANCELLED; // we gave up (e.g. order was cancelled)

    /** Once terminal, an intent never changes again. */
    public boolean isTerminal() {
        return this == SUCCEEDED || this == FAILED || this == EXPIRED || this == CANCELLED;
    }
}
