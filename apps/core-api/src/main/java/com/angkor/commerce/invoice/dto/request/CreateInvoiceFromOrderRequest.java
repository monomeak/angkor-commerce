package com.angkor.commerce.invoice.dto.request;

import jakarta.validation.constraints.DecimalMax;
import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import java.math.BigDecimal;
import java.time.LocalDate;

public record CreateInvoiceFromOrderRequest(
    @NotNull(message = "Order is required") Long orderId,

    @DecimalMin("0.0") @DecimalMax("100.0") BigDecimal discountPercentage,
    @DecimalMin("0.0") @DecimalMax("100.0") BigDecimal taxPercentage,
    @Size(max = 500) String notes,
    LocalDate issueDate, // defaults to today
    LocalDate dueDate // defaults to issueDate + payment terms
) {}
