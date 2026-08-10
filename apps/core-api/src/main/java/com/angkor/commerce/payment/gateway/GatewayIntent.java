package com.angkor.commerce.payment.gateway;

import java.time.Instant;

public record GatewayIntent(
    String qrPayload, // render as a QR image client-side
    String deeplink, // "Open ABA app" button on mobile
    Instant expiresAt
) {}
