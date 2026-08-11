import { dashboardOverviewData } from "../data/dashboard-overview-data";
import type { DashboardOverviewData } from "../types/dashboard";

/*
 * PLACEHOLDER ENDPOINT: there is no real "/dashboard/overview" route on
 * DummyJSON (or most backends, this early) — this file exists so the
 * hook/view layer already has its final shape. Point AppConfig.apiBaseUrl at
 * your real API once `/dashboard/overview` (or whatever you name it) exists,
 * and delete the fallback below.
 *
 * For now: attempts the real call, and falls back to local mock data if
 * the endpoint 404s or the network call fails, so the page keeps working
 * during development without a backend.
 */

export async function fetchDashboardOverview(
  apiBaseUrl: string,
): Promise<DashboardOverviewData> {
  try {
    const res = await fetch(`${apiBaseUrl}/dashboard/overview`);
    if (!res.ok) {
      throw new Error(`Dashboard overview endpoint returned ${res.status}`);
    }
    return await res.json();
  } catch (err) {
    if (process.env.NODE_ENV !== "production") {
      console.warn(
        "[dashboard-api] Falling back to mock data - real endpoint not available yet:",
        err instanceof Error ? err.message : err,
      );
      return dashboardOverviewData;
    }
    throw err;
  }
}
