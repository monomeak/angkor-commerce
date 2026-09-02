package com.angkor.commerce.dashboard.dto.response;

import com.angkor.commerce.invoice.InvoiceStatus;
import java.math.BigDecimal;
import java.time.LocalDate;

/** A row in the overview's "latest invoices" table. Same fields the invoice list shows. */
public record RecentInvoiceResponse(
    Long id,
    String invoiceNumber,
    Long customerId,
    String customerName,
    InvoiceStatus invoiceStatus,
    LocalDate issueDate,
    LocalDate dueDate,
    BigDecimal total,
    BigDecimal balance,
    String currency
) {}
