package com.angkor.commerce.customer.address;

import com.angkor.commerce.common.enums.RecordStatus;
import com.angkor.commerce.customer.Customer;
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
import jakarta.persistence.Table;
import java.math.BigDecimal;
import java.time.Instant;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import org.springframework.data.annotation.CreatedDate;
import org.springframework.data.annotation.LastModifiedDate;
import org.springframework.data.jpa.domain.support.AuditingEntityListener;

@Entity
@Table(name = "customer_addresses")
@Getter
@Setter
@NoArgsConstructor
@EntityListeners(AuditingEntityListener.class)
public class CustomerAddress {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY, optional = true)
    @JoinColumn(name = "customer_id", nullable = false)
    private Customer customer;

    @Column(length = 50)
    private String label;

    @Column(name = "recipient_name", nullable = false, length = 50)
    private String recipientName;

    @Column(name = "recipient_phone", nullable = false, length = 30)
    private String recipientPhone;

    @Column(nullable = false, length = 255)
    private String line1; // Home #

    @Column(length = 255) // Road #
    private String line2;

    @Column(length = 100)
    private String commune;

    @Column(nullable = false, length = 100)
    private String district;

    @Column(nullable = false, length = 100)
    private String province;

    @Column(name = "postal_code", length = 20)
    private String postalCode;

    @Column(nullable = false, length = 2)
    private String country = "KH";

    /**
     * Where the customer dropped the pin on the map, or null when they only typed the address.
     * Exact decimals rather than a float so the pin comes back exactly where it was left.
     */
    @Column(precision = 9, scale = 6)
    private BigDecimal latitude;

    @Column(precision = 9, scale = 6)
    private BigDecimal longitude;

    @Column(name = "is_default", nullable = false)
    private boolean isDefault = false;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 20)
    private RecordStatus status = RecordStatus.ACTIVE; // Default value

    @CreatedDate
    @Column(name = "created_at", nullable = false, updatable = false)
    private Instant createdAt;

    @LastModifiedDate
    @Column(name = "updated_at", nullable = false)
    private Instant updatedAt;
}
