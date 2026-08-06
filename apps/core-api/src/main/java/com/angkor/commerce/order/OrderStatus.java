package com.angkor.commerce.order;

import com.fasterxml.jackson.annotation.JsonValue;

/** See CORE_API_DATA_MODEL.md section 4: PENDING -> INVOICED, or PENDING -> CANCELLED. */
public enum OrderStatus {
    PENDING,
    INVOICED,
    CANCELLED;

    /** Lowercase on the wire. Reads are case-insensitive via JacksonConfig. */
    @JsonValue
    public String toJson() {
        return name().toLowerCase();
    }

    public boolean canTransitionTo(OrderStatus next) {
        return switch (this) {
            case PENDING -> next == INVOICED || next == CANCELLED;
            case INVOICED, CANCELLED -> false; // terminal
        };
    }
}
