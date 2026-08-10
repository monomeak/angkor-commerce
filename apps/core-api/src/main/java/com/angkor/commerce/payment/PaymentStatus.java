package com.angkor.commerce.payment;

import com.fasterxml.jackson.annotation.JsonValue;

public enum PaymentStatus {
    COMPLETED,
    VOIDED,
    REFUNDED
}
