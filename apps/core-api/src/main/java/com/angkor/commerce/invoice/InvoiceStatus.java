package com.angkor.commerce.invoice;

public enum InvoiceStatus {
    ISSUED,
    PARTIALLY_PAID,
    PAID,
    CANCELLED;

    public boolean canTransitionTo(InvoiceStatus next) {
        return switch (this) {
            case ISSUED -> next == PAID || next == CANCELLED;
            case PAID -> next == PARTIALLY_PAID; // a payment was voided
            case PARTIALLY_PAID -> next == PAID || next == CANCELLED;
            case CANCELLED -> false; // terminal
        };
    }

    public boolean acceptsPayment() {
        return this == ISSUED || this == PARTIALLY_PAID;
    }
}
