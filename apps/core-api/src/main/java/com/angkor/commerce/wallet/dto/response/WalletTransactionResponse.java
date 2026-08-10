package com.angkor.commerce.wallet.dto.response;

import com.angkor.commerce.user.dto.response.UserSummaryResponse;
import com.angkor.commerce.wallet.WalletTxnType;
import java.math.BigDecimal;
import java.time.Instant;
import java.util.Currency;

public record WalletTransactionResponse(
    Long id,
    WalletTxnType type,
    BigDecimal amount, // always positive; direction comes from type
    Currency currency,
    BigDecimal balanceAfter,
    Long orderId,
    Long paymentIntentId,
    Long reversedTransactionId,
    String description,
    UserSummaryResponse createdBy,
    Instant createdAt
) {}
