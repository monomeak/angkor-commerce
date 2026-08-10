package com.angkor.commerce.wallet.impl;

import com.angkor.commerce.common.dto.PageResponse;
import com.angkor.commerce.common.exception.AlreadyProcessedException;
import com.angkor.commerce.common.exception.InsufficientBalanceException;
import com.angkor.commerce.common.exception.ResourceNotFoundException;
import com.angkor.commerce.common.exception.ValidationException;
import com.angkor.commerce.customer.Customer;
import com.angkor.commerce.customer.CustomerRepository;
import com.angkor.commerce.user.User;
import com.angkor.commerce.user.UserRepository;
import com.angkor.commerce.wallet.CustomerWallet;
import com.angkor.commerce.wallet.CustomerWalletRepository;
import com.angkor.commerce.wallet.TxnDirection;
import com.angkor.commerce.wallet.WalletService;
import com.angkor.commerce.wallet.WalletStatus;
import com.angkor.commerce.wallet.WalletTransaction;
import com.angkor.commerce.wallet.WalletTransactionRepository;
import com.angkor.commerce.wallet.WalletTxnType;
import com.angkor.commerce.wallet.dto.request.WalletQueryParams;
import com.angkor.commerce.wallet.dto.request.WalletResponse;
import com.angkor.commerce.wallet.dto.request.WalletTopUpRequest;
import com.angkor.commerce.wallet.dto.response.WalletTransactionResponse;
import com.angkor.commerce.wallet.mapper.WalletMapper;
import static java.util.function.Function.identity;
import java.math.BigDecimal;
import java.time.Instant;
import java.util.Currency;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Objects;
import java.util.Optional;
import java.util.Set;
import java.util.stream.Collectors;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
@Slf4j
public class WalletServiceImpl implements WalletService {

    private static final String COLLECTION_KEY = "transactions";
    private static final String DEFAULT_CURRENCY = "USD";

    private final CustomerWalletRepository walletRepository;
    private final WalletTransactionRepository txnRepository;
    private final CustomerRepository customerRepository;
    private final UserRepository userRepository;

    private final WalletMapper walletMapper;

    @Override
    public WalletResponse getWallet(Long customerId, String currency) {
        String code = normalise(currency);

        return walletRepository
            .findByCustomerIdAndCurrency(customerId, code)
            // heldAmount stays null → zero: nothing reserves wallet money yet
            .map(wallet -> walletMapper.toResponse(wallet, null, lastTransactionAt(wallet.getId())))
            // No wallet yet = zero balance, not an error
            .orElseGet(() -> WalletResponse.empty(customerId, Currency.getInstance(code)));
    }

    @Override
    public PageResponse<WalletTransactionResponse> getTransactions(
        Long customerId,
        String currency,
        WalletQueryParams query
    ) {
        Optional<CustomerWallet> wallet = walletRepository.findByCustomerIdAndCurrency(
            customerId,
            normalise(currency)
        );

        // No wallet → no ledger. Empty page, not a 404.
        if (wallet.isEmpty()) {
            return PageResponse.empty(COLLECTION_KEY, query.skip(), query.limit());
        }

        Long walletId = wallet.get().getId();

        Page<WalletTransaction> page = query.type() == null
            ? txnRepository.findByWalletId(walletId, query.toPageable())
            : txnRepository.findByWalletIdAndTxnType(walletId, query.type(), query.toPageable());

        Map<Long, User> actors = loadActors(page.getContent());
        var items = page
            .getContent()
            .stream()
            .map(txn -> walletMapper.toResponse(txn, actors.get(txn.getCreatedBy())))
            .toList();

        return PageResponse.of(COLLECTION_KEY, items, page.getTotalElements(), query.skip(), query.limit());
    }

    @Override
    @Transactional
    public WalletTransactionResponse topUp(Long customerId, WalletTopUpRequest request, Long staffId) {
        WalletTransaction txn = credit(
            customerId,
            normalise(request.currency()),
            request.amount(),
            WalletTxnType.TOPUP,
            null,
            request.description(),
            staffId
        );

        return walletMapper.toResponse(txn, Optional.ofNullable(staffId).flatMap(userRepository::findById).orElse(null));
    }

    private Instant lastTransactionAt(Long walletId) {
        return txnRepository
            .findFirstByWalletIdOrderByIdDesc(walletId)
            .map(WalletTransaction::getCreatedAt)
            .orElse(null);
    }

    /** One query for every staff member on the page, not one per row. */
    private Map<Long, User> loadActors(List<WalletTransaction> txns) {
        Set<Long> staffIds = txns
            .stream()
            .map(WalletTransaction::getCreatedBy)
            .filter(Objects::nonNull)
            .collect(Collectors.toSet());

        // A HashMap, never Map.of(): customer-driven rows look themselves up with a null key.
        return staffIds.isEmpty()
            ? new HashMap<>()
            : userRepository.findAllById(staffIds).stream().collect(Collectors.toMap(User::getId, identity()));
    }

    @Override
    @Transactional
    public WalletTransaction debit(
        Long customerId,
        String currency,
        BigDecimal amount,
        WalletTxnType type,
        Long paymentIntentId,
        Long orderId,
        String description
    ) {
        // Lock first

        CustomerWallet wallet = walletRepository
            .lockByCustomerIdAndCurrency(customerId, currency)
            .orElseThrow(() -> new ResourceNotFoundException("No %s wallet for the customer".formatted(currency)));
        // Idemotency: this inten may already have been charged.
        // The nq_wallet_txn_intent index is the backstop if two requests race past this check  - one insert will fail.

        if (paymentIntentId != null && txnRepository.existsByPaymentIntentId(paymentIntentId)) {
            throw new AlreadyProcessedException("Payment intent " + paymentIntentId + " already charged");
        }

        if (wallet.getStatus() != WalletStatus.ACTIVE) {
            throw new ValidationException("Wallet is " + wallet.getStatus().name().toLowerCase());
        }
        if (wallet.getBalance().compareTo(amount) < 0) {
            throw new InsufficientBalanceException(
                "Balance %s %s is not enough for %s %s".formatted(wallet.getBalance(), currency, amount, currency)
            );
        }

        BigDecimal newBalance = wallet.getBalance().subtract(amount);
        wallet.setBalance(newBalance);

        return txnRepository.save(
            entry(wallet, type, TxnDirection.DEBIT, amount, newBalance, paymentIntentId, orderId, description, null)
        );
    }

    @Override
    @Transactional
    public WalletTransaction credit(
        Long customerId,
        String currency,
        BigDecimal amount,
        WalletTxnType type,
        Long orderId,
        String description,
        Long staffId
    ) {

        CustomerWallet wallet = walletRepository.lockByCustomerIdAndCurrency(customerId, currency).orElseGet(()-> createWallet(customerId, currency));
        if (wallet.getStatus() == WalletStatus.CLOSED) {
            throw new ValidationException("Wallet is closed");

        }

        BigDecimal newBalance = wallet.getBalance().add(amount);
        wallet.setBalance(newBalance);




        return txnRepository.save(entry(wallet, type, TxnDirection.CREDIT, amount, newBalance, null, orderId, description, staffId));

    }

    private WalletTransaction entry(
        CustomerWallet wallet,
        WalletTxnType type,
        TxnDirection direction,
        BigDecimal amount,
        BigDecimal balanceAfter,
        Long intentId,
        Long orderId,
        String description,
        Long staffId
    ) {
        WalletTransaction txn = new WalletTransaction();
        txn.setWallet(wallet);
        txn.setTxnType(type);
        txn.setDirection(direction);
        txn.setAmount(amount);
        txn.setBalanceAfter(balanceAfter);
        txn.setPaymentIntentId(intentId);
        txn.setDescription(description);
        txn.setOrderId(orderId);
        txn.setCreatedBy(staffId);

        return txn;
    }

    private CustomerWallet createWallet(Long customerId, String currency) {
        Customer customer = this.customerRepository
            .findById(customerId)
            .orElseThrow(() -> new ResourceNotFoundException("Customer " + customerId + " was not found."));

        CustomerWallet wallet = new CustomerWallet();
        wallet.setCustomer(customer);
        wallet.setCurrency(currency);
        return walletRepository.save(wallet);
    }

    /** "usd" and "USD" are the same wallet; an unknown code is a 400, not a 500 from {@link Currency}. */
    private String normalise(String currency) {
        String code = currency == null || currency.isBlank() ? DEFAULT_CURRENCY : currency.trim().toUpperCase();
        try {
            Currency.getInstance(code);
        } catch (IllegalArgumentException e) {
            throw new ValidationException("Unknown currency '" + currency + "'");
        }
        return code;
    }
}
