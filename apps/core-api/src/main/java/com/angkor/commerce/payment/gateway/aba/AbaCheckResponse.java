package com.angkor.commerce.payment.gateway.aba;

import com.fasterxml.jackson.annotation.JsonProperty;

public record AbaCheckResponse(AbaStatus status, AbaCheckData data) {
    public record AbaStatus(String code, String message) {}

    public record AbaCheckData(
        @JsonProperty("payment_status") String paymentStatus, // APPROVED/DECLINED/PENDING
        @JsonProperty("payment_amount") String paymentAmount,
        @JsonProperty("payment_currency") String paymentCurrency,
        @JsonProperty("apv") String apv
    ) {}
}
