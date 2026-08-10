package com.angkor.commerce.customer.wishlist.dto.response;

import com.angkor.commerce.common.enums.RecordStatus;
import java.math.BigDecimal;
import java.time.Instant;

/**
 * Product fields are flattened onto the item rather than nested under a
 * "product" object, matching how InvoiceItemResponse already carries title,
 * thumbnail, and price directly.
 *
 * <p>{@code stock} and {@code productStatus} are included so the frontend can
 * grey out a card whose product went inactive or hit zero stock without a
 * second request.
 */
public record WishlistItemResponse(
    Long id,
    Long productId,
    String title,
    String description,
    String thumbnail,
    BigDecimal price,
    String currency,
    RecordStatus productStatus,
    Instant createdAt
) {}
