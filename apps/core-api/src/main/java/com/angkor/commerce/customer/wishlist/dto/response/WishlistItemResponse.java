package com.angkor.commerce.customer.wishlist.dto.response;

import com.angkor.commerce.common.enums.RecordStatus;
import java.math.BigDecimal;
import java.time.Instant;

/**
 * Product fields are flattened onto the item rather than nested under a
 * "product" object, matching how InvoiceItemResponse already carries title,
 * thumbnail, and price directly.
 *
 * <p>{@code totalStock} and {@code productStatus} are included so the frontend can
 * grey out a card whose product went inactive or hit zero stock without a
 * second request.
 *
 * <p>{@code price} is the lowest effective variant price and {@code totalStock} their sum —
 * the same aggregates {@code ProductSummaryResponse} carries, so a saved product shows the
 * price the shopper saw on the grid rather than the product's base price.
 *
 * <p>{@code categorySlug} is here for the same reason it is on the list row: a storefront
 * card links to {@code /product/{categorySlug}/{productId}} and cannot build that from a
 * category name, which is not unique.
 */
public record WishlistItemResponse(
    Long id,
    Long productId,
    String title,
    String description,
    String categorySlug,
    String thumbnail,
    BigDecimal price,
    String currency,
    BigDecimal discountPercentage,
    Integer totalStock,
    RecordStatus productStatus,
    Instant createdAt
) {}
