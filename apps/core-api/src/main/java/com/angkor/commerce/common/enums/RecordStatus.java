package com.angkor.commerce.common.enums;

import com.fasterxml.jackson.annotation.JsonProperty;

/**
 * Lifecycle status shared by business records (users, customers, products, ...).
 * Business records are archived, never hard-deleted, per the project's data-retention rules.
 */
public enum RecordStatus {
    @JsonProperty("active")
    ACTIVE,

    @JsonProperty("inactive")
    INACTIVE,

    @JsonProperty("deleted")
    DELETED
}
