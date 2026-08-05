package com.angkor.commerce.product.dto.request;

import java.math.BigDecimal;
import java.util.List;

import jakarta.validation.Valid;
import jakarta.validation.constraints.DecimalMax;
import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.Digits;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotEmpty;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;

public record CreateProductRequest(
    @NotBlank @Size(max = 200) String name,

    String description,

    @NotNull(message = "Category is required") Long categoryId,

    @NotNull @DecimalMin(value = "0.0", inclusive = false) @Digits(integer = 15, fraction = 4) BigDecimal price,

    @Pattern(regexp = "^[A-Z]{3}$") String currency, // default KHR

    @DecimalMin("0.0") @DecimalMax("100.0") @Digits(integer = 3, fraction = 2) BigDecimal discountPercentage, // default 0

    @Size(max = 50) String unit, // default "piece"

    String thumbnailUrl,

//    @Valid List<ProductImageRequest> images,

    @NotEmpty(message = "At least one variant is required") @Valid List<CreateProductVariantRequest> variants
) {}
