import { useQuery } from "@tanstack/react-query";
import { fetchDashboardOverview } from "../api/dashboard-api";
import { dashboardOverviewData } from "../data/dashboard-overview-data";
import { dashboardkeys } from "../lib/query-keys";
import type { DashboardOverviewData } from "../types/dashboard";

// `initialData` is the same mock dataset used by dashboard-api.ts's

export function useDashboardOverview() {
  return useQuery<DashboardOverviewData>({
    queryKey: dashboardkeys.overview(),
    queryFn: fetchDashboardOverview,
    initialData: dashboardOverviewData,
    staleTime: 60 * 1000,
  });
}
