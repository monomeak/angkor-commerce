package com.angkor.commerce.invoice;

import com.fasterxml.jackson.annotation.JsonValue;

public enum InvoiceStatus {
    DRAFT,
    ISSUED,
    PARTIALLY_PAID,
    PAID,
    OVERDUE,
    CANCELLED;

    /** Lowercase on the wire. Reads are case-insensitive via JacksonConfig. */
    @JsonValue
    public String toJson() {
        return name().toLowerCase();
    }
}
