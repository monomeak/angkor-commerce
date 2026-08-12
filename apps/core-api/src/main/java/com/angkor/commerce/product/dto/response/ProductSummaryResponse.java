package com.angkor.commerce.product.dto.response;

import com.angkor.commerce.common.enums.RecordStatus;
import java.math.BigDecimal;

public record ProductSummaryResponse(
    Long id,
    String name,
    String category, // flattened to name for list views
    BigDecimal price, // min effective variant price
    String currency,
    BigDecimal discountPercentage,
    BigDecimal rating,
    Integer totalStock,
    Integer variantCount,
    String thumbnail,
    RecordStatus status
) {}
