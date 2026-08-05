package com.angkor.commerce.product.dto.response;

import java.math.BigDecimal;

public record ProductVariantResponse(
    Long id,
    String size,
    String sku,
    Integer stock,
    BigDecimal price, // effective: priceOverride ?? product.price
    BigDecimal priceOverride // null when inheriting product price
) {}
