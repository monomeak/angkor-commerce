package com.angkor.commerce.product.dto.request;

import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.Digits;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;
import java.math.BigDecimal;

public record UpdateProductVariantRequest(
    @Size(max = 50) String size, // null for single-variant products

    @NotBlank(message = "SKU is required") @Pattern(regexp = "^[A-Z0-9\\-]{3,100}$") String sku,

    @NotNull @Min(0) Integer stock,

    @DecimalMin(value = "0.0", inclusive = false) @Digits(integer = 15, fraction = 4) BigDecimal priceOverride // null → inherit product price
) {}
