package com.angkor.commerce.dashboard.dto.response;

import java.util.List;

/**
 * Everything the overview screen renders, in one call — four widgets fed by four aggregate
 * queries, which is cheaper and less racy than four endpoints the client would have to
 * assemble itself.
 */
public record DashboardOverviewResponse(
    DashboardSummaryResponse summary,
    List<RevenuePointResponse> revenueByMonth,
    List<InvoiceStatusBreakdownResponse> invoiceStatusBreakdown,
    List<RecentInvoiceResponse> recentInvoices
) {}
