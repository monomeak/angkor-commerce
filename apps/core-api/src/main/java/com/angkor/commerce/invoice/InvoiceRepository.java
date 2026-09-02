package com.angkor.commerce.invoice;

import com.angkor.commerce.common.enums.RecordStatus;
import jakarta.persistence.LockModeType;
import java.util.Optional;
import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.data.jpa.repository.Lock;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

public interface InvoiceRepository extends JpaRepository<Invoice, Long>, JpaSpecificationExecutor<Invoice> {
    @EntityGraph(attributePaths = { "items", "customer" })
    @Query("select i from Invoice i where i.id = :id and i.status <> 'DELETED'")
    Optional<Invoice> findActiveWithItemsById(@Param("id") Long id);

    /**
     * Locks the row so concurrent payments serialize. Every path that
     * changes paid_amount starts here.
     */
    @Lock(LockModeType.PESSIMISTIC_WRITE)
    @Query("select i from Invoice i where i.id = :id")
    Optional<Invoice> lockById(@Param("id") Long id);

    boolean existsByOrderIdAndStatusNot(Long orderId, RecordStatus status);

    // ── Lists ──
    // Filtering, search and date ranges live in InvoiceSpecification, which also fetches
    // the customer the rows are labelled with.

    Optional<Invoice> findByOrderIdAndStatusNot(Long orderId, RecordStatus status);

    @Query(value = "SELECT nextval('invoice_number_seq')", nativeQuery = true)
    long nextInvoiceSequence();
}
