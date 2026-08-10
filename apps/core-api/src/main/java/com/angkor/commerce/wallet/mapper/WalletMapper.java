package com.angkor.commerce.wallet.mapper;

import static java.util.Objects.requireNonNullElse;

import com.angkor.commerce.user.User;
import com.angkor.commerce.user.mapper.UserMapper;
import com.angkor.commerce.wallet.CustomerWallet;
import com.angkor.commerce.wallet.WalletTransaction;
import com.angkor.commerce.wallet.dto.request.WalletResponse;
import com.angkor.commerce.wallet.dto.response.WalletTransactionResponse;
import java.math.BigDecimal;
import java.time.Instant;
import java.util.Currency;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Component;

@Component
@RequiredArgsConstructor
public class WalletMapper {

    private final UserMapper userMapper;

    public WalletResponse toResponse(CustomerWallet wallet, BigDecimal heldAmount, Instant lastTransactionAt) {
        BigDecimal held = requireNonNullElse(heldAmount, BigDecimal.ZERO);
        return new WalletResponse(
            wallet.getId(),
            wallet.getCustomer().getId(),
            Currency.getInstance(wallet.getCurrency()),
            wallet.getBalance(),
            held,
            wallet.getBalance().subtract(held).max(BigDecimal.ZERO),
            wallet.getStatus(),
            lastTransactionAt,
            wallet.getCreatedAt(),
            wallet.getUpdatedAt()
        );
    }

    /** Customer-facing rows: nobody but staff actions carries an actor. */
    public WalletTransactionResponse toResponse(WalletTransaction txn) {
        return toResponse(txn, null);
    }

    /**
     * {@code createdBy} is the staff member behind a manual credit/adjustment — pass the
     * loaded {@link User} for {@code txn.getCreatedBy()}, or null for customer-driven rows.
     */
    public WalletTransactionResponse toResponse(WalletTransaction txn, User createdBy) {
        return new WalletTransactionResponse(
            txn.getId(),
            txn.getTxnType(),
            txn.getAmount(),
            Currency.getInstance(txn.getWallet().getCurrency()),
            txn.getBalanceAfter(),
            txn.getOrderId(),
            txn.getPaymentIntentId(),
            null, // reversedTransactionId — reversals are not modelled yet
            txn.getDescription(),
            userMapper.toSummary(createdBy),
            txn.getCreatedAt()
        );
    }
}
