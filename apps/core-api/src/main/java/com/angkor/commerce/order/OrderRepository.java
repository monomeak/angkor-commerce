package com.angkor.commerce.order;

import java.time.Instant;
import java.util.List;
import java.util.Optional;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

public interface OrderRepository extends JpaRepository<Order, Long> {
    /** Dashboard KPI: orders placed but not yet paid for — the work waiting on staff. */
    long countByStatus(OrderStatus status);

    // HACK: revisit Entity Graph
    // Details
    @EntityGraph(attributePaths = { "items" })
    Optional<Order> findWithItemsByIdAndCustomerId(Long id, Long customerId);

    @EntityGraph(attributePaths = { "items" })
    Page<Order> findByCustomerIdAndStatus(Long customerId, OrderStatus status, Pageable pageable);

    @EntityGraph(attributePaths = { "items" })
    Optional<Order> findWithItemsById(Long id);

    // ── Lists: also need items, for the count fields ──
    @EntityGraph(attributePaths = { "items" })
    Page<Order> findByCustomerId(Long customerId, Pageable pageable);

    @EntityGraph(attributePaths = { "items" })
    Optional<Order> findByIdAndCustomerId(Long orderId, Long customerId);

    @EntityGraph(attributePaths = { "items" })
    Page<Order> findByStatus(OrderStatus status, Pageable pageable);

    @Override
    @EntityGraph(attributePaths = { "items" })
    Page<Order> findAll(Pageable pageable);

    // ── Order numbering ──
    @Query(value = "SELECT nextval('order_number_seq')", nativeQuery = true)
    long nextOrderSequence();

    @EntityGraph(attributePaths = { "items" })
    @Query("select o from Order o where o.status = 'PENDING' and o.placedAt < :cutoff")
    List<Order> findPendingOlderThan(@Param("cutoff") Instant cutoff);
}
