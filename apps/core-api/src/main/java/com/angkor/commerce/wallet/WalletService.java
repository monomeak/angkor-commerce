package com.angkor.commerce.wallet;

import com.angkor.commerce.common.dto.PageResponse;
import com.angkor.commerce.wallet.dto.request.WalletQueryParams;
import com.angkor.commerce.wallet.dto.request.WalletResponse;
import com.angkor.commerce.wallet.dto.request.WalletTopUpRequest;
import com.angkor.commerce.wallet.dto.response.WalletTransactionResponse;
import java.math.BigDecimal;

public interface WalletService {
    WalletResponse getWallet(Long customerId, String currency);
    PageResponse<WalletTransactionResponse> getTransactions(Long customerId, String currency, WalletQueryParams query);

    /**
     * Staff-initiated credit. Unlike {@link #credit}, which hands internal callers the raw
     * ledger row, this returns the API view with the acting staff member attached.
     */
    WalletTransactionResponse topUp(Long customerId, WalletTopUpRequest request, Long staffId);

    //    /** Spend. Throws InsufficientBalanceException when short. */

    WalletTransaction debit(
        Long customerId,
        String currency,
        BigDecimal amount,
        WalletTxnType type,
        Long paymentIntentId,
        Long orderId,
        String description
    );

    /** Add money. Creates the wallet on first credit. */

    WalletTransaction credit(
        Long customerId,
        String currency,
        BigDecimal amount,
        WalletTxnType type,
        Long orderId,
        String description,
        Long staffId
    );
}
