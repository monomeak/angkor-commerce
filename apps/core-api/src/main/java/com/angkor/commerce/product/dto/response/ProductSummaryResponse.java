package com.angkor.commerce.product.dto.response;

import com.angkor.commerce.common.enums.RecordStatus;
import java.math.BigDecimal;

/**
 * The list row. Deliberately lighter than {@link ProductResponse} — no variants, no images.
 *
 * <p>{@code categoryId} and {@code categorySlug} sit alongside the flattened {@code category}
 * name because a storefront card links to {@code /product/{categorySlug}/{id}}, and category
 * names are not unique (Men, Women and Children each have a "Shoes"), so the name alone
 * cannot be resolved back to a category.
 */
public record ProductSummaryResponse(
    Long id,
    String name,
    String description,
    String category, // flattened to name for list views
    Long categoryId,
    String categorySlug,
    BigDecimal price, // min effective variant price
    String currency,
    BigDecimal discountPercentage,
    BigDecimal rating,
    Integer totalStock,
    Integer variantCount,
    String thumbnail,
    RecordStatus status
) {}
