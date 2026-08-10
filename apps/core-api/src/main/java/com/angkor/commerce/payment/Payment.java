package com.angkor.commerce.payment;

import com.angkor.commerce.common.BaseEntity;
import com.angkor.commerce.invoice.Invoice;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.FetchType;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.Table;
import java.math.BigDecimal;
import java.time.Instant;
import java.time.LocalDate;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

/**
 * Staff-recorded bookkeeping entry against an {@link Invoice} — not a live payment
 * transaction (no provider tracking, no pending/webhook lifecycle). See
 * CORE_API_DATA_MODEL.md section 6 for why this is kept separate from the future
 * customer-initiated {@code OrderPayment} concept. Who recorded it is
 * {@link BaseEntity#getCreatedBy()}.
 */
@Getter
@Setter
@NoArgsConstructor
@Entity
@Table(name = "payments")
public class Payment extends BaseEntity {

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "invoice_id", nullable = false)
    private Invoice invoice;

    @Column(nullable = false, precision = 19, scale = 4)
    private BigDecimal amount;

    @Column(nullable = false, length = 3)
    private String currency = "KHR";

    @Enumerated(EnumType.STRING)
    @Column(name = "payment_method", nullable = false, length = 30)
    private PaymentMethod paymentMethod;

    /** STAFF typed it in, or GATEWAY wrote it automatically. From V7. */
    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 20)
    private PaymentSource source = PaymentSource.GATEWAY;

    @Enumerated(EnumType.STRING)
    @Column(name = "payment_status", nullable = false, length = 20)
    private PaymentStatus paymentStatus = PaymentStatus.COMPLETED;

    /** Links a gateway payment back to its intent. From V7. */
    @Column(name = "payment_intent_id")
    private Long paymentIntentId;

    @Column(name = "payment_date", nullable = false)
    private LocalDate paymentDate;

    @Column(name = "reference_number", length = 150)
    private String referenceNumber;

    @Column(columnDefinition = "TEXT")
    private String notes;

    @Column(name = "voided_at")
    private Instant voidedAt;

    @Column(name = "void_reason", columnDefinition = "TEXT")
    private String voidReason;
}
