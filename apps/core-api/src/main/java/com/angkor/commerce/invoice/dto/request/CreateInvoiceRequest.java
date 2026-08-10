package com.angkor.commerce.invoice.dto.request;

import jakarta.validation.Valid;
import jakarta.validation.constraints.DecimalMax;
import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.NotEmpty;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;
import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;

public record CreateInvoiceRequest(
    @NotNull(message = "Customer ID is required") Long customerId,

    @NotEmpty(message = "At least one item is required") @Valid List<InvoiceItemRequest> items,
    LocalDate issueDate,
    LocalDate dueDate,
    @DecimalMin("0.0") @DecimalMax("100.0") BigDecimal discountPercentage,
    @DecimalMin("0.0") @DecimalMax("100.0") BigDecimal taxPercentage,
    @Pattern(regexp = "^[A-Z]{3}$") String currency,
    @Size(max = 1000) String notes
) {}
