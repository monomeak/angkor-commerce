package com.angkor.commerce.invoice.dto.request;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

public record CancelnvoiceRequest(
    @NotBlank(message = "A cancellation reason is required.") @Size(max = 500) String reason
) {}
