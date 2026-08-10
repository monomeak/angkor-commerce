package com.angkor.commerce.payment.dto.response;

import com.angkor.commerce.payment.PaymentMethod;
import com.angkor.commerce.payment.PaymentSource;
import com.angkor.commerce.payment.PaymentStatus;
import java.math.BigDecimal;
import java.time.LocalDate;

public record PaymentSummaryResponse(
    Long id,
    BigDecimal amount,
    PaymentMethod paymentMethod,
    PaymentStatus paymentStatus,
    PaymentSource source,
    LocalDate paymentDate,
    String referenceNumber
) {}
