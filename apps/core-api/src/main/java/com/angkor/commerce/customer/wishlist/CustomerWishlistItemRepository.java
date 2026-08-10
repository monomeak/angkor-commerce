package com.angkor.commerce.customer.wishlist;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface CustomerWishlistItemRepository extends JpaRepository<CustomerWishlistItem, Long>


{
    /**
     * Spring Data resolves {@code CustomerId} to the association path
     * {@code customer.id}, so no explicit query is needed.
     *
     * <p>The entity graph fetches only {@code product}. Without it a 30-item
     * page fires one query for the rows and then 30 more to lazily load each
     * product. It deliberately does not fetch {@code customer} — the customer
     * never appears in the response, so there is nothing to join it for.
     *
     * <p>Verify with {@code hibernate.generate_statistics=true}: the list
     * endpoint should issue 2 queries (rows + count), not 32.
     */
    @EntityGraph(attributePaths = "product")
    Page<CustomerWishlistItem> findByCustomerId(Long customerId, Pageable pageable);

    @EntityGraph(attributePaths = "product")
    Optional<CustomerWishlistItem> findByCustomerIdAndProductId(Long customerId, Long productId);

    boolean existsByCustomerIdAndProductId(Long customerId, Long productId);

    /** Returns the row count so the caller can tell "removed" from "wasn't there". */
    long deleteByCustomerIdAndProductId(Long customerId, Long productId);

    long countByCustomerId(Long customerId);

}
