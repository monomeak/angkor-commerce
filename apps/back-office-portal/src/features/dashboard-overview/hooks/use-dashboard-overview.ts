"use client";

import { useQuery } from "@tanstack/react-query";
import { useAppConfig } from "@/components/providers/app-config-provider";
import { fetchDashboardOverview } from "../api/dashboard-api";
import { dashboardKeys } from "../lib/query-keys";
import type { DashboardOverview } from "../types/dashboard";

export function useDashboardOverview() {
    const { apiBaseUrl } = useAppConfig();

    return useQuery<DashboardOverview>({
        queryKey: dashboardKeys.overview(),
        queryFn: () => fetchDashboardOverview(apiBaseUrl),
        // The aggregates move whenever an order is paid, but not fast enough to warrant
        // refetching on every focus.
        staleTime: 60 * 1000
    });
}
