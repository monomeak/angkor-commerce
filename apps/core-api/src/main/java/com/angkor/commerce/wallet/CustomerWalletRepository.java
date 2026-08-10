package com.angkor.commerce.wallet;

import jakarta.persistence.LockModeType;
import java.util.Optional;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Lock;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

public interface CustomerWalletRepository extends JpaRepository<CustomerWallet, Long> {
    Optional<CustomerWallet> findByCustomerIdAndCurrency(Long customerId, String currency);

    /**
     * Locks the wallet row. Two concurrent purchases from one wallet
     * are serialised — the second waits, re-reads the balance the
     * first left, and rejects cleanly if it is now short.
     *
     *
     */

    @Lock(LockModeType.PESSIMISTIC_WRITE)
    @Query(
        """
        select w from CustomerWallet w
        where w.customer.id = :customerId and w.currency = :currency
        """
    )
    Optional<CustomerWallet> lockByCustomerIdAndCurrency(
        @Param("customerId") Long customserId,
        @Param("currency") String currency
    );
}
