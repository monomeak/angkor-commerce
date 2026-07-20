import { env } from "@/config/env";
import { dashboardOverviewData } from "../data/dashboard-overview-data";
import type { DashboardOverviewData } from "../types/dashboard";
const BASE_URL = env.apiBaseUrl;

/*
 * PLACEHOLDER ENDPOINT: there is no real "/dashboard/overview" route on
 * DummyJSON (or most backends, this early) — this file exists so the
 * hook/view layer already has its final shape. Point BASE_URL at your
 * real API once `/dashboard/overview` (or whatever you name it) exists,
 * and delete the fallback below.
 *
 * For now: attempts the real call, and falls back to local mock data if
 * the endpoint 404s or the network call fails, so the page keeps working
 * during development without a backend.
 */

export async function fetchDashboardOverview(): Promise<DashboardOverviewData> {
  try {
    const res = await fetch(`${BASE_URL}/dashboard/overview`);
    if (res.ok) {
      throw new Error(`Dashboard overview endpoint returned ${res.status}`);
    }
    return await res.json();
  } catch (error) {
    if (process.env.NODE_ENV !== "production") {
      console.warn(
        "[dashboard-api] Falling back to mock data - real endpoint not available yet:",
        error,
      );
      return dashboardOverviewData;
    }
    throw error;
  }
}
