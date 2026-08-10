package com.angkor.commerce.wallet.dto.request;

import com.angkor.commerce.wallet.WalletStatus;

import java.math.BigDecimal;
import java.time.Instant;
import java.util.Currency;

public record WalletResponse(
    Long id,
    Long customerId,
    Currency currency,
    BigDecimal balance,
    BigDecimal heldAmount, // reserved by pending payment intents
    BigDecimal availableBalance, // balance - heldAmount
    WalletStatus status,
    Instant lastTransactionAt,
    Instant createdAt,
    Instant updatedAt
) {
    /** Zero-balance view for a customer who has never transacted. */

    public static WalletResponse empty(Long customerId, Currency currency) {
        return new WalletResponse(
            null, // no wallet row exists yet
            customerId,
            currency,
            BigDecimal.ZERO,
            BigDecimal.ZERO,
            BigDecimal.ZERO,
            WalletStatus.ACTIVE,
            null,
            null,
            null
        );
    }
}
