package com.angkor.commerce.payment.gateway;

import java.math.BigDecimal;
import java.time.Duration;

public record GatewayIntentRequest(
    String reference, // ≤ 20 chars — becomes PayWay's tran_id
    BigDecimal amount,
    String currency,
    String description, // "Order ORD-2026-000042"
    String customerName,
    String customerPhone,
    Duration validFor
) {}
