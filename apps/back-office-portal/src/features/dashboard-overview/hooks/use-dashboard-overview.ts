import { useQuery } from "@tanstack/react-query";
import { useAppConfig } from "@/components/providers/app-config-provider";
import { fetchDashboardOverview } from "../api/dashboard-api";
import { dashboardOverviewData } from "../data/dashboard-overview-data";
import { dashboardKeys } from "../lib/query-keys";
import type { DashboardOverviewData } from "../types/dashboard";

// `initialData` is the same mock dataset used by dashboard-api.ts's

export function useDashboardOverview() {
  const { apiBaseUrl } = useAppConfig();

  return useQuery<DashboardOverviewData>({
    queryKey: dashboardKeys.overview(),
    queryFn: () => fetchDashboardOverview(apiBaseUrl),
    initialData: dashboardOverviewData,
    staleTime: 60 * 1000,
  });
}
