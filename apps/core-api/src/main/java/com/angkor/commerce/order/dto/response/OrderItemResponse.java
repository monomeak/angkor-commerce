package com.angkor.commerce.order.dto.response;

import java.math.BigDecimal;

public record OrderItemResponse(
    Long id,
    Long productId,
    Long variantId,
    String sku,
    String title,
    String thumbnail, // resolved URL, not the object key
    BigDecimal unitPrice,
    Integer quantity,
    BigDecimal lineTotal
) {}
