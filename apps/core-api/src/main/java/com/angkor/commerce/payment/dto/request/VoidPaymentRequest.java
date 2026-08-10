package com.angkor.commerce.payment.dto.request;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

public record VoidPaymentRequest(@NotBlank(message = "A void reason is required") @Size(max = 500) String reason) {}
