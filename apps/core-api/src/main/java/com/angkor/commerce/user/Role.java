package com.angkor.commerce.user;

import com.fasterxml.jackson.annotation.JsonProperty;

public enum Role {
    @JsonProperty("super_admin")
    SUPER_ADMIN,

    @JsonProperty("shop_admin")
    SHOP_ADMIN,

    @JsonProperty("staff")
    STAFF
}
