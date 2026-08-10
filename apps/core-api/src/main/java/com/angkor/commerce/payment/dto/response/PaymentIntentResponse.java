package com.angkor.commerce.payment.dto.response;

import com.angkor.commerce.payment.intent.IntentStatus;
import java.math.BigDecimal;
import java.time.Instant;

public record PaymentIntentResponse(
    String reference,
    String provider,
    BigDecimal amount,
    String currency,
    IntentStatus status,
    String qrPayload,
    String deeplink,
    Instant expiresAt
) {}
