package com.angkor.commerce.invoice;

import com.angkor.commerce.common.enums.RecordStatus;
import jakarta.persistence.LockModeType;
import java.time.LocalDate;
import java.util.List;
import java.util.Optional;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Lock;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

public interface InvoiceRepository extends JpaRepository<Invoice, Long> {
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
    @EntityGraph(attributePaths = { "customer" })
    Page<Invoice> findByStatusNot(RecordStatus status, Pageable pageable);

    Optional<Invoice> findByOrderIdAndStatusNot(Long orderId, RecordStatus status);

    @EntityGraph(attributePaths = { "customer" })
    Page<Invoice> findByInvoiceStatusAndStatusNot(InvoiceStatus invoiceStatus, RecordStatus status, Pageable pageable);

    @EntityGraph(attributePaths = { "customer" })
    Page<Invoice> findByCustomerIdAndStatusNot(Long customerId, RecordStatus status, Pageable pageable);

    @Query(value = "SELECT nextval('invoice_number_seq')", nativeQuery = true)
    long nextInvoiceSequence();
}
