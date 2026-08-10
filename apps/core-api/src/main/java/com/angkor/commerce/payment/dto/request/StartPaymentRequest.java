package com.angkor.commerce.payment.dto.request;

import jakarta.validation.constraints.Pattern;

public record StartPaymentRequest(
    @Pattern(regexp = "^[A-Z_]{2,30}$", message = "Unknown payment provider") String provider
) {}
