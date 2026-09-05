package com.angkor.commerce.wallet.dto.response;

import com.angkor.commerce.user.dto.response.UserSummaryResponse;
import com.angkor.commerce.wallet.TxnDirection;
import com.angkor.commerce.wallet.WalletTxnType;
import java.math.BigDecimal;
import java.time.Instant;
import java.util.Currency;

public record WalletTransactionResponse(
    Long id,
    WalletTxnType type,
    TxnDirection direction,
    BigDecimal amount, // always positive; the sign is `direction`
    Currency currency,
    BigDecimal balanceAfter,
    Long orderId,
    Long paymentIntentId,
    Long reversedTransactionId,
    String description,
    UserSummaryResponse createdBy,
    Instant createdAt
) {}
