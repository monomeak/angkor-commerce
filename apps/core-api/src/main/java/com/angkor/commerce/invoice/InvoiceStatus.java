package com.angkor.commerce.invoice;

import com.fasterxml.jackson.annotation.JsonProperty;

public enum InvoiceStatus {
    @JsonProperty("draft")
    DRAFT,

    @JsonProperty("issued")
    ISSUED,

    @JsonProperty("partially_paid")
    PARTIALLY_PAID,

    @JsonProperty("paid")
    PAID,

    @JsonProperty("overdue")
    OVERDUE,

    @JsonProperty("cancelled")
    CANCELLED
}
