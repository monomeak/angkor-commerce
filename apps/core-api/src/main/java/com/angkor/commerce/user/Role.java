package com.angkor.commerce.user;

import com.fasterxml.jackson.annotation.JsonValue;

public enum Role {
    SUPER_ADMIN,
    SHOP_ADMIN,
    STAFF;

    /** Lowercase on the wire. Reads are case-insensitive via JacksonConfig. */
    @JsonValue
    public String toJson() {
        return name().toLowerCase();
    }
}
