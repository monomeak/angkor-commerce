package com.angkor.commerce.payment.intent;

import java.time.Instant;
import java.util.List;
import java.util.Optional;

import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Lock;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import jakarta.persistence.LockModeType;

public interface PaymentIntentRepository extends JpaRepository<PaymentIntent, Long> {
    /**
     * Locks the row. Every path that might CONFIRM a payment goes
     * through this — the pushback handler and the reconciliation
     * poller can arrive at the same moment, and the lock makes the
     * second one wait and then see "already SUCCEEDED".
     */

    @Lock(LockModeType.PESSIMISTIC_WRITE)
    @Query("select p from PaymentIntent p where p.reference = :reference")
    Optional<PaymentIntent> lockByReference(@Param("reference") String reference);

    Optional<PaymentIntent> findByReference(String reference);

    /** The customer's own view — scoped so nobody reads someone else's. */
    @Query(
        """
        select p from PaymentIntent p
        where p.reference = :reference
          and p.orderId in (select o.id from Order o where o.customer.id = :customerId)
        """
    )
    Optional<PaymentIntent> findByReferenceForCustomer(
        @Param("reference") String reference,
        @Param("customerId") Long customerId
    );

    /** A reusable live intent for this order, if one exists. */
    @Query(
        """
        select p from PaymentIntent p
        where p.orderId = :orderId
          and p.intentStatus in ('CREATED', 'PENDING')
        order by p.id desc
        """
    )
    Optional<PaymentIntent> findLiveByOrderId(@Param("orderId") Long orderId);

    /** Work for the reconciliation poller. */
    @Query(
        """
        select p from PaymentIntent p
        where p.intentStatus in ('CREATED', 'PENDING')
          and (p.lastPolledAt is null or p.lastPolledAt < :cutoff)
        order by p.lastPolledAt asc nulls first
        """
    )
    List<PaymentIntent> findStalePending(@Param("cutoff") Instant cutoff, Pageable pageable);
}
