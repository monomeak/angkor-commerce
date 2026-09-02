package com.angkor.commerce.dashboard.dto.response;

import com.angkor.commerce.invoice.InvoiceStatus;
import java.math.BigDecimal;

/** How the invoice book splits by status — count and value per status. */
public record InvoiceStatusBreakdownResponse(InvoiceStatus status, long count, BigDecimal amount) {}
