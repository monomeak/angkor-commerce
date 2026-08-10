package com.angkor.commerce.payment.dto.response;

import com.angkor.commerce.payment.intent.IntentStatus;
import java.time.Instant;

public record PaymentStatusResponse(
    String reference,
    IntentStatus status,
    String orderNumber,
    String invoiceNumber, // filled in once paid
    Instant confirmedAt,
    String failureReason
) {}
