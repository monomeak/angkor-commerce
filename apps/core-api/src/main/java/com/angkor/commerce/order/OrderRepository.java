package com.angkor.commerce.order;

import java.util.Optional;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;

public interface OrderRepository extends JpaRepository<Order, Long> {
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
    Page<Order> findByStatus(OrderStatus status, Pageable pageable);

    @Override
    @EntityGraph(attributePaths = { "items" })
    Page<Order> findAll(Pageable pageable);

    // ── Order numbering ──
    @Query(value = "SELECT nextval('order_number_seq')", nativeQuery = true)
    long nextOrderSequence();
}
