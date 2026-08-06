package com.angkor.commerce.payment;

import com.fasterxml.jackson.annotation.JsonValue;

public enum PaymentMethod {
    CASH,
    BANK_TRANSFER,
    QR_CODE,
    CARD,
    OTHER;

    /** Lowercase on the wire. Reads are case-insensitive via JacksonConfig. */
    @JsonValue
    public String toJson() {
        return name().toLowerCase();
    }
}
