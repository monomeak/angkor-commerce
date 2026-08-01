package com.angkor.commerce.payment;

import com.fasterxml.jackson.annotation.JsonProperty;

public enum PaymentStatus {
    @JsonProperty("completed")
    COMPLETED,

    @JsonProperty("voided")
    VOIDED,

    @JsonProperty("refunded")
    REFUNDED
}
