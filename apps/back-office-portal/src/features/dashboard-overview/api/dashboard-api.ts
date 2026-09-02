import { apiFetch, parseResponse } from "@/lib/api-client";
import type { DashboardOverviewDto } from "../schemas/dashboard-api.schema";
import { dashboardOverviewDtoSchema } from "../schemas/dashboard-api.schema";
import type { DashboardOverview } from "../types/dashboard";

/*
 * One call for the whole screen. The mock fallback this file used to carry is gone with the
 * endpoint it was standing in for — a dashboard that silently shows invented numbers when the
 * API is down is worse than one that says it could not load.
 */

/** Months of revenue history the chart shows. core-api clamps this to 1..24. */
export const REVENUE_MONTHS = 6;

export async function fetchDashboardOverview(apiBaseUrl: string): Promise<DashboardOverview> {
    const data = await apiFetch<unknown>(apiBaseUrl, `/dashboard/overview?months=${REVENUE_MONTHS}`);
    const dto: DashboardOverviewDto = parseResponse(dashboardOverviewDtoSchema, data);

    return {
        ...dto,
        // Only the customer name needs a fallback; everything else is non-null from the API.
        recentInvoices: dto.recentInvoices.map((invoice) => ({
            ...invoice,
            customerName: invoice.customerName?.trim() || `Customer #${invoice.customerId}`
        }))
    };
}
