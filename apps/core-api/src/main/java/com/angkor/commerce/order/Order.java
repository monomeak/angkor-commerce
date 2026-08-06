package com.angkor.commerce.order;

import com.angkor.commerce.customer.Customer;
import jakarta.persistence.CascadeType;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EntityListeners;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.FetchType;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.OneToMany;
import jakarta.persistence.Table;
import java.math.BigDecimal;
import java.time.Instant;
import java.util.ArrayList;
import java.util.List;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import org.springframework.data.annotation.CreatedDate;
import org.springframework.data.annotation.LastModifiedDate;
import org.springframework.data.jpa.domain.support.AuditingEntityListener;

/**
 * Net-new: no table existed for this before (CORE_API_DATA_MODEL.md section 4 — the SQL
 * schema previously jumped straight to back-office {@code invoices}). Created only at
 * checkout; cart stays client-only (decision 1). Shipping address is captured as its own
 * columns rather than an FK to {@code customer_addresses} (decision 2), matching
 * customer-portal's existing {@code ShippingAddress} shape: fullName, phone, address,
 * city, postalCode?, notes?.
 */
@Getter
@Setter
@NoArgsConstructor
@Entity
@Table(name = "orders")
@EntityListeners(AuditingEntityListener.class)
public class Order {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "order_number", nullable = false, unique = true, length = 50)
    private String orderNumber;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "customer_id", nullable = false)
    private Customer customer;

    @OneToMany(mappedBy = "order", cascade = CascadeType.ALL, orphanRemoval = true, fetch = FetchType.LAZY)
    private List<OrderItem> items = new ArrayList<>();

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 20)
    private OrderStatus status = OrderStatus.PENDING;

    @Column(name = "shipping_full_name", nullable = false, length = 150)
    private String shippingFullName;

    @Column(name = "shipping_phone", nullable = false, length = 30)
    private String shippingPhone;

    /** Flattened: "No. 12B, Street 271, 2nd floor, Toul Tumpoung 1, Chamkarmon" */
    @Column(name = "shipping_address", nullable = false, columnDefinition = "TEXT")
    private String shippingAddress;

    @Column(name = "shipping_city", nullable = false, length = 100)
    private String shippingCity;

    @Column(name = "shipping_postal_code", length = 30)
    private String shippingPostalCode;

    @Column(name = "shipping_notes", columnDefinition = "TEXT")
    private String shippingNotes;

    @Column(nullable = false, precision = 19, scale = 4)
    private BigDecimal subtotal = BigDecimal.ZERO;

    @Column(name = "shipping_fee", nullable = false, precision = 19, scale = 4)
    private BigDecimal shippingFee = BigDecimal.ZERO;

    @Column(nullable = false, precision = 19, scale = 4)
    private BigDecimal total = BigDecimal.ZERO;

    @Column(nullable = false, length = 3)
    private String currency = "KHR";

    @Column(name = "placed_at", nullable = false)
    private Instant placedAt = Instant.now();

    @CreatedDate
    @Column(name = "created_at", nullable = false, updatable = false)
    private Instant createdAt;

    @LastModifiedDate
    @Column(name = "updated_at", nullable = false)
    private Instant updatedAt;

    /** Keeps both sides of the relationship consistent. Always use this. */
    public void addItem(OrderItem item) {
        items.add(item);
        item.setOrder(this);
    }
}
