package com.angkor.commerce.payment;

import com.fasterxml.jackson.annotation.JsonValue;

public enum PaymentStatus {
    COMPLETED,
    VOIDED,
    REFUNDED;

    /** Lowercase on the wire. Reads are case-insensitive via JacksonConfig. */
    @JsonValue
    public String toJson() {
        return name().toLowerCase();
    }
}
