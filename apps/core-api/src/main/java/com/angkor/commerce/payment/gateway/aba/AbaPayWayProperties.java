package com.angkor.commerce.payment.gateway.aba;

import org.springframework.boot.context.properties.ConfigurationProperties;
import org.springframework.validation.annotation.Validated;

import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;

@ConfigurationProperties(prefix = "angkor.payment.aba")
@Validated
public record AbaPayWayProperties(
    @NotBlank String baseUrl,
    @NotBlank String merchantId,
    @NotBlank String apiKey,
    @NotBlank String callbackUrl,
    @Min(3) @Max(1440) int lifetimeMinutes, // PayWay minimum is 3
    @NotBlank String paymentOption // abapay_khqr
) {}
