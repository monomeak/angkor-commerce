package com.angkor.commerce.payment.dto.response;

import com.angkor.commerce.payment.PaymentMethod;
import com.angkor.commerce.payment.PaymentSource;
import com.angkor.commerce.payment.PaymentStatus;
import java.math.BigDecimal;
import java.time.Instant;
import java.time.LocalDate;

/** Full payment view. Back office only — void details are staff information. */
public record PaymentResponse(
    Long id,
    Long invoiceId,
    String invoiceNumber,
    BigDecimal amount,
    String currency,
    PaymentMethod paymentMethod,
    PaymentStatus paymentStatus,
    PaymentSource source,
    LocalDate paymentDate,
    String referenceNumber,
    String notes,
    Instant voidedAt,
    String voidReason,
    Instant createdAt
) {}
