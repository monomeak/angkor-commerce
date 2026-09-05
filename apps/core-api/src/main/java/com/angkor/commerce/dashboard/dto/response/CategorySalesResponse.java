package com.angkor.commerce.dashboard.dto.response;

import java.math.BigDecimal;

/**
 * Units shifted in one top-level category. Products hang off leaf categories ("Men > Shoes"),
 * so the leaves are rolled up to their root here — the shop thinks in Men/Women/Children, and
 * a chart with twenty-two slices says nothing.
 */
public record CategorySalesResponse(
    Long categoryId,
    String category,
    String slug,
    long unitsSold,
    BigDecimal amount
) {}
