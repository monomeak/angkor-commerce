package com.angkor.commerce.product;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EntityListeners;
import jakarta.persistence.FetchType;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.Table;
import java.math.BigDecimal;
import java.time.Instant;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import org.springframework.data.annotation.CreatedDate;
import org.springframework.data.annotation.LastModifiedDate;
import org.springframework.data.jpa.domain.support.AuditingEntityListener;

/**
 * Single source of truth for product stock/sku (CORE_API_DATA_MODEL.md decision 9).
 * {@code size = null} means the product has no size concept (one implicit variant);
 * otherwise one row per real size. DB enforces at most one no-size row and at most
 * one row per (product, size) via partial unique indexes — not expressible as plain
 * JPA annotations, so those constraints live in the migration, not here.
 */
@Getter
@Setter
@NoArgsConstructor
@Entity
@Table(name = "product_variants")
@EntityListeners(AuditingEntityListener.class)
public class ProductVariant {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "product_id", nullable = false)
    private Product product;

    @Column(length = 50)
    private String size;

    @Column(nullable = false, unique = true, length = 100)
    private String sku;

    @Column(nullable = false)
    private Integer stock = 0;

    @Column(name = "price_override", precision = 19, scale = 4)
    private BigDecimal priceOverride;

    @CreatedDate
    @Column(name = "created_at", nullable = false, updatable = false)
    private Instant createdAt;

    @LastModifiedDate
    @Column(name = "updated_at", nullable = false)
    private Instant updatedAt;
}
