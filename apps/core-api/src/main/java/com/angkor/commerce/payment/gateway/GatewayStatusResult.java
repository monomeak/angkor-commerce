package com.angkor.commerce.payment.gateway;

import java.math.BigDecimal;

/**
 * Everything check-transaction tells us. The amount is here because the
 * pushback does not carry one — verification and amount-checking happen
 * in the same call.
 */
public record GatewayStatusResult(
    GatewayStatus status,
    BigDecimal amount, // null when status is PENDING/UNKNOWN
    String currency,
    String providerTxnId // PayWay's approval reference
) {
    public static GatewayStatusResult unknown() {
        return new GatewayStatusResult(GatewayStatus.UNKNOWN, null, null, null);
    }
}
