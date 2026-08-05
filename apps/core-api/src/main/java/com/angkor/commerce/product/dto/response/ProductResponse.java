package com.angkor.commerce.product.dto.response;

import com.angkor.commerce.category.dto.response.CategoryResponse;
import com.angkor.commerce.common.enums.RecordStatus;
import java.math.BigDecimal;
import java.time.Instant;
import java.util.List;

public record ProductResponse(
    Long id,
    String name,
    String description,
    CategoryResponse category,
    BigDecimal price,
    String currency,
    BigDecimal discountPercentage,
    BigDecimal rating,
    String unit,
    RecordStatus status,
    String thumbnailUrl,
    List<ProductImageResponse> images,
    List<ProductVariantResponse> variants,
    Integer totalStock, // ← computed: sum of variant stock
    Instant createdAt,
    Instant updatedAt
) {}
