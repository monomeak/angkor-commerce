package com.angkor.commerce.wallet.dto.request;

import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.Digits;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;
import java.math.BigDecimal;

public record WalletTopUpRequest(
    @NotNull @DecimalMin(value = "0.0", inclusive = false) @Digits(integer = 15, fraction = 4) BigDecimal amount,

    @Pattern(regexp = "^[A-Z]{3}$") String currency,

    @NotBlank(message = "A description is required") @Size(max = 500) String description
) {}
