"use client";

import { useTranslations } from "next-intl";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { ApiError } from "@/lib/api-client";
import { DashboardStatCard } from "../components/dashboard-stat-card";
import { InvoiceStatusCard } from "../components/invoice-status-card";
import { LatestInvoices } from "../components/latest-invoices";
import { RevenueOverviewChart } from "../components/revenue-overview-chart";
import { REVENUE_MONTHS } from "../api/dashboard-api";
import { useDashboardOverview } from "../hooks/use-dashboard-overview";
import { buildStats } from "../lib/stats";

export function DashboardOverviewView() {
    const t = useTranslations("Overview");
    const { data, isPending, isError, error, isFetching, refetch } = useDashboardOverview();

    if (isPending) {
        return <DashboardSkeleton />;
    }

    if (isError) {
        const isForbidden = error instanceof ApiError && (error.status === 401 || error.status === 403);

        return (
            <div className="space-y-3">
                <p className="text-sm text-destructive">{isForbidden ? t("forbidden") : t("error")}</p>
                <Button variant="outline" disabled={isFetching} onClick={() => void refetch()}>
                    {isFetching ? t("loading") : t("retry")}
                </Button>
            </div>
        );
    }

    const { summary, revenueByMonth, invoiceStatusBreakdown, recentInvoices } = data;

    return (
        <div className="space-y-6">
            <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
                {buildStats(summary, revenueByMonth).map((stat) => (
                    <DashboardStatCard key={stat.key} stat={stat} />
                ))}
            </section>

            <section className="grid min-w-0 gap-6 xl:grid-cols-[minmax(0,2fr)_minmax(320px,1fr)]">
                <RevenueOverviewChart
                    data={revenueByMonth}
                    currency={summary.currency}
                    months={REVENUE_MONTHS}
                />
                <InvoiceStatusCard data={invoiceStatusBreakdown} currency={summary.currency} />
            </section>

            <section>
                <LatestInvoices invoices={recentInvoices} />
            </section>
        </div>
    );
}

/** Mirrors the real layout so the page doesn't jump when the numbers land. */
function DashboardSkeleton() {
    return (
        <div className="space-y-6">
            <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
                {Array.from({ length: 6 }).map((_, index) => (
                    <Card key={index}>
                        <CardContent className="space-y-2 p-6">
                            <Skeleton className="h-4 w-24" />
                            <Skeleton className="h-7 w-32" />
                        </CardContent>
                    </Card>
                ))}
            </section>
            <section className="grid min-w-0 gap-6 xl:grid-cols-[minmax(0,2fr)_minmax(320px,1fr)]">
                <Skeleton className="h-[380px] w-full rounded-xl" />
                <Skeleton className="h-[380px] w-full rounded-xl" />
            </section>
            <Skeleton className="h-64 w-full rounded-xl" />
        </div>
    );
}
