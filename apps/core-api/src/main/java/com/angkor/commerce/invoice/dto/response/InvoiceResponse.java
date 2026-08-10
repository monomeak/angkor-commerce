package com.angkor.commerce.invoice.dto.response;

import com.angkor.commerce.customer.dto.response.CustomerSummaryResponse;
import com.angkor.commerce.invoice.InvoiceStatus;
import com.angkor.commerce.payment.dto.response.PaymentSummaryResponse;
import java.math.BigDecimal;
import java.time.Instant;
import java.time.LocalDate;
import java.util.List;

public record InvoiceResponse(
    Long id,
    String invoiceNumber,
    InvoiceStatus invoiceStatus,
    Long orderId,
    CustomerSummaryResponse customer,
    List<InvoiceItemResponse> items,
    List<PaymentSummaryResponse> payments,
    LocalDate issueDate,
    LocalDate dueDate,
    BigDecimal subtotal,
    BigDecimal discountPercentage,
    BigDecimal discountAmount,
    BigDecimal taxPercentage,
    BigDecimal taxAmount,
    BigDecimal total,
    BigDecimal paidAmount,
    BigDecimal balance,
    String currency,
    Integer totalItems,
    Integer totalQuantity,
    String notes,
    Instant issuedAt,
    Instant cancelledAt,
    String cancellationReason,
    Instant createdAt,
    Instant updatedAt
) {}
