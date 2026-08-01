package com.angkor.commerce.order;

import com.fasterxml.jackson.annotation.JsonProperty;

/** See CORE_API_DATA_MODEL.md section 4: PENDING -> INVOICED, or PENDING -> CANCELLED. */
public enum OrderStatus {
    @JsonProperty("pending")
    PENDING,

    @JsonProperty("invoiced")
    INVOICED,

    @JsonProperty("cancelled")
    CANCELLED
}
