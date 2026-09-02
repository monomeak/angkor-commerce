package com.angkor.commerce.dashboard.dto.response;

import java.math.BigDecimal;

/**
 * The KPI row on the back office overview.
 *
 * Money is summed across every invoice and payment regardless of their currency — the shop
 * trades in one (see {@code angkor.default-currency}), and `currency` says which. If a second
 * currency ever lands, these totals need grouping before they mean anything.
 */
public record DashboardSummaryResponse(
    /** Money actually received: the sum of COMPLETED payments. */
    BigDecimal totalRevenue,
    /** Money still owed: the balance of every ISSUED or PARTIALLY_PAID invoice. */
    BigDecimal outstandingAmount,
    String currency,
    long totalProducts,
    long totalCustomers,
    /** Orders placed but not yet paid for. */
    long pendingOrders,
    long totalInvoices
) {}
