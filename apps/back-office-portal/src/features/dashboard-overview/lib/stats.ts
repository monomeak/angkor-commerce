import { Boxes, ClipboardList, FileText, HandCoins, Users, Wallet } from "lucide-react";
import { formatMoney } from "@/lib/formatters";
import type { DashboardStat, DashboardSummary, RevenuePoint } from "../types/dashboard";

/**
 * Turns the summary into the KPI cards. The card component only renders — deciding what a
 * card says lives here, so the labels stay in one list and the view stays a layout.
 */
export function buildStats(summary: DashboardSummary, revenueByMonth: RevenuePoint[]): DashboardStat[] {
    const money = (amount: number) => formatMoney(amount, summary.currency);

    return [
        {
            key: "totalRevenue",
            value: money(summary.totalRevenue),
            icon: Wallet,
            change: revenueChange(revenueByMonth)
        },
        { key: "totalProducts", value: String(summary.totalProducts), icon: Boxes },
        { key: "totalCustomers", value: String(summary.totalCustomers), icon: Users },
        { key: "totalInvoices", value: String(summary.totalInvoices), icon: FileText }
    ];
}

/**
 * This month against last, from the same series the chart draws. Absent when there is no
 * previous month to compare with, or when last month took nothing — a jump from zero is a
 * percentage of nothing, which is why the mock's "+12.4%" was always fiction.
 */
function revenueChange(revenueByMonth: RevenuePoint[]): DashboardStat["change"] {
    if (revenueByMonth.length < 2) {
        return undefined;
    }

    const current = revenueByMonth[revenueByMonth.length - 1].revenue;
    const previous = revenueByMonth[revenueByMonth.length - 2].revenue;

    if (previous <= 0) {
        return undefined;
    }

    const delta = ((current - previous) / previous) * 100;

    return {
        value: `${Math.abs(delta).toFixed(1)}%`,
        direction: delta >= 0 ? "up" : "down"
    };
}

/** "2026-09" → "Sep". The API sends a sortable month key; the axis wants a readable one. */
export function monthLabel(month: string): string {
    const [year, monthPart] = month.split("-").map(Number);
    if (!year || !monthPart) {
        return month;
    }

    return new Intl.DateTimeFormat("en-KH", { month: "short" }).format(new Date(Date.UTC(year, monthPart - 1, 1)));
}
