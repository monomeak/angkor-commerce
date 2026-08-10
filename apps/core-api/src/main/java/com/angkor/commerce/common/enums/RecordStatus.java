package com.angkor.commerce.common.enums;

import com.fasterxml.jackson.annotation.JsonValue;

/**
 * Lifecycle status shared by business records (users, customers, products, ...).
 * Business records are archived, never hard-deleted, per the project's data-retention rules.
 */
public enum RecordStatus {
    ACTIVE,
    INACTIVE,
    DELETED;

    /** Lowercase on the wire. Reads are case-insensitive via JacksonConfig. */
    @JsonValue
    public String toJson() {
        return name().toLowerCase();
    }
}
