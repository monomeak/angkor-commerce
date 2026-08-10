package com.angkor.commerce.invoice.dto.response;

import com.angkor.commerce.invoice.InvoiceStatus;
import java.math.BigDecimal;
import java.time.LocalDate;

public record InvoiceSummaryResponse(
    Long id,
    String invoiceNumber,
    InvoiceStatus invoiceStatus,
    String customerName,
    LocalDate issueDate,
    LocalDate dueDate,
    BigDecimal total,
    BigDecimal paidAmount,
    BigDecimal balance,
    String currency
) {}
