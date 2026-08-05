package com.angkor.commerce.order;

import com.angkor.commerce.product.entities.Product;
import com.angkor.commerce.product.entities.ProductVariant;
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
import org.springframework.data.jpa.domain.support.AuditingEntityListener;

/**
 * Net-new (CORE_API_DATA_MODEL.md section 4). Snapshots {@code title}/{@code sku}/
 * {@code unitPriceSnapshot} at order time, same pattern as {@code invoice_items}, so later
 * {@link Product} price edits never retroactively change a placed order (decision 4).
 * {@code productVariant} is never null (decision 9 — every product has >= 1 variant, so
 * cart/checkout never branches on "does this product have variants").
 */
@Getter
@Setter
@NoArgsConstructor
@Entity
@Table(name = "order_items")
@EntityListeners(AuditingEntityListener.class)
public class OrderItem {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "order_id", nullable = false)
    private Order order;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "product_id")
    private Product product;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "product_variant_id", nullable = false)
    private ProductVariant productVariant;

    @Column(length = 100)
    private String sku;

    @Column(nullable = false, length = 200)
    private String title;

    @Column(name = "thumbnail_url", columnDefinition = "TEXT")
    private String thumbnailUrl;

    @Column(name = "unit_price_snapshot", nullable = false, precision = 19, scale = 4)
    private BigDecimal unitPriceSnapshot;

    @Column(nullable = false)
    private Integer quantity;

    @Column(name = "line_total", nullable = false, precision = 19, scale = 4)
    private BigDecimal lineTotal;

    @CreatedDate
    @Column(name = "created_at", nullable = false, updatable = false)
    private Instant createdAt;
}
