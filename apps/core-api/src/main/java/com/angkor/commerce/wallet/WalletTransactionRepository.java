package com.angkor.commerce.wallet;

import java.math.BigDecimal;
import java.util.Optional;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

public interface WalletTransactionRepository extends JpaRepository<WalletTransaction, Long> {
    /** Newest ledger row — drives the wallet's {@code lastTransactionAt}. */
    Optional<WalletTransaction> findFirstByWalletIdOrderByIdDesc(Long walletId);

    boolean existsByPaymentIntentId(Long parentIntendId);

    /**
     * The wallet's answer to "was this intent paid?" — used by the
     * gateway adapter's checkStatus. Joins through the intent's
     * reference so the adapter needs only one repository.
     */

    @Query(
        """
        select t from WalletTransaction t
        where t.paymentIntentId = (
            select p.id from PaymentIntent p where p.reference = :reference)
        """
    )
    Optional<WalletTransaction> findByIntentReference(@Param("reference") String reference);

    /** Integrity check: cached balance vs the ledger. */
    @Query(
        """
        select coalesce(sum(
          case when t.direction = 'CREDIT' then t.amount else -t.amount end
        ), 0)
        from WalletTransaction t where t.wallet.id = :walletId
        """
    )
    BigDecimal sumLedger(@Param("walletId") Long walletId);



    @EntityGraph(attributePaths = {"wallet"})
    Page<WalletTransaction> findByWalletId(Long walletId, Pageable pageable);

    @EntityGraph(attributePaths = {"wallet"})
    Page<WalletTransaction> findByWalletIdAndTxnType(Long walletId,
                                                     WalletTxnType txnType,
                                                     Pageable pageable);
}
