package com.angkor.commerce.payment.gateway.aba;

import com.fasterxml.jackson.annotation.JsonProperty;

public record AbaQrResponse(AbaStatus status, AbaQrData data) {
    public record AbaStatus(String code, String message) {}

    public record AbaQrData(
        @JsonProperty("qr_string") String qrString,
        @JsonProperty("abapay_deeplink") String abapayDeeplink
    ) {}
}
