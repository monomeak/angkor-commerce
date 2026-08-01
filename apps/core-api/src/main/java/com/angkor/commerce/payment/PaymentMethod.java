package com.angkor.commerce.payment;

import com.fasterxml.jackson.annotation.JsonProperty;

public enum PaymentMethod {
    @JsonProperty("cash")
    CASH,

    @JsonProperty("bank_transfer")
    BANK_TRANSFER,

    @JsonProperty("qr_code")
    QR_CODE,

    @JsonProperty("card")
    CARD,

    @JsonProperty("other")
    OTHER
}
