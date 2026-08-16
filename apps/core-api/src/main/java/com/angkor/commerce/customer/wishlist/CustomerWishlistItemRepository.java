package com.angkor.commerce.customer.wishlist;

import java.util.List;
import java.util.Optional;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

public interface CustomerWishlistItemRepository extends JpaRepository<CustomerWishlistItem, Long> {
    /**
     * Spring Data resolves {@code CustomerId} to the association path
     * {@code customer.id}, so no explicit query is needed.
     *
     * <p>The entity graph fetches the product and its category. Without it a
     * 30-item page fires one query for the rows and then 30 more to lazily
     * load each product, plus 30 again for the categories the response needs
     * for its {@code categorySlug}. It deliberately does not fetch
     * {@code customer} — the customer never appears in the response, so there
     * is nothing to join it for.
     *
     * <p>Both are to-one associations, so paging still happens in the database;
     * only a fetched collection would force Hibernate to page in memory.
     *
     * <p>Verify with {@code hibernate.generate_statistics=true}: the list
     * endpoint should issue 3 queries (rows + count + variant aggregates),
     * not 60-odd.
     */
    @EntityGraph(attributePaths = { "product", "product.category" })
    Page<CustomerWishlistItem> findByCustomerId(Long customerId, Pageable pageable);

    @EntityGraph(attributePaths = { "product", "product.category" })
    Optional<CustomerWishlistItem> findByCustomerIdAndProductId(Long customerId, Long productId);

    /**
     * Just the ids, for the storefront's "is this one saved?" state. Every product grid asks
     * it, so it stays a single projection query — no rows, no products, no paging.
     */
    @Query(
        "select w.product.id from CustomerWishlistItem w where w.customer.id = :customerId order by w.createdAt desc"
    )
    List<Long> findProductIdsByCustomerId(@Param("customerId") Long customerId);

    boolean existsByCustomerIdAndProductId(Long customerId, Long productId);

    /** Returns the row count so the caller can tell "removed" from "wasn't there". */
    long deleteByCustomerIdAndProductId(Long customerId, Long productId);

    /**
     * One DELETE for the whole list. A derived {@code deleteByCustomerId} would load every
     * row first and then delete them one at a time; clearing is a bulk operation.
     *
     * <p>{@code clearAutomatically} drops the persistence context afterwards, so nothing in
     * the same transaction keeps serving rows this statement has already removed.
     */
    @Modifying(clearAutomatically = true)
    @Query("delete from CustomerWishlistItem w where w.customer.id = :customerId")
    int deleteAllByCustomerId(@Param("customerId") Long customerId);

    long countByCustomerId(Long customerId);
}
