package com.angkor.commerce.product.dto.request;

import com.angkor.commerce.common.enums.RecordStatus;
import jakarta.validation.constraints.DecimalMax;
import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;
import java.math.BigDecimal;

public record UpdateProductRequest(
    @Size(max = 200) String name,
    String description,
    Long categoryId,
    @DecimalMin(value = "0.0", inclusive = false) BigDecimal price,
    @Pattern(regexp = "^[A-Z]{3}$") String currency,
    @DecimalMin("0.0") @DecimalMax("100.0") BigDecimal discountPercentage,
    @Size(max = 50) String unit,
    String thumbnailUrl,
    RecordStatus status
) {}
