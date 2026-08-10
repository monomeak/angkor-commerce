package com.angkor.commerce.wallet.dto.request;

import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Pattern;
import java.math.BigDecimal;

public record WalletSeedRequest(
    @NotNull Long customerId,
    @NotNull @DecimalMin(value = "0.0", inclusive = false) BigDecimal amount,
    @Pattern(regexp = "^[A-Z]{3}$") String currency
) {}
