package com.angkor.commerce.dashboard;

import com.angkor.commerce.dashboard.dto.response.DashboardOverviewResponse;

public interface DashboardService {
    /** @param months how far back the revenue series runs, including the current month. */
    DashboardOverviewResponse getOverview(int months);
}
