package com.angkor.commerce.product.port;

public record StockChange(Long variantId, int quantity) {
    // Compact constructor — runs before fields are assigned
    public StockChange {
        if (quantity <= 0) {
            throw new IllegalArgumentException("Quantity must be positive");
        }
    }
}
