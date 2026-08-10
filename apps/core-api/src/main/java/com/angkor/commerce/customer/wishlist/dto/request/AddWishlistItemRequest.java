package com.angkor.commerce.customer.wishlist.dto.request;


import jakarta.validation.constraints.NotNull;

public record AddWishlistItemRequest(
        @NotNull(message = "Product is required")
        Long productId
) {
}
