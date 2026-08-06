package com.angkor.commerce.product.port;

import java.math.BigDecimal;

public record VariantSnapshot(
    Long variantId,
    Long productId,
    String productName,
    String size,
    String sku,
    String thumbnailKey,
    BigDecimal unitPrice, // priceOverride if set, else product price
    String currency,
    String unit,
    int availableStock,
    boolean purchasable // product is ACTIVE
) {}
