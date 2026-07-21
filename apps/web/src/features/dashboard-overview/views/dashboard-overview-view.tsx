"use client";

import { DashboardStatCard } from "../components/dashboard-stat-card";
import { RevenueOverviewChart } from "../components/revenue-overview-chart";
import { InvoiceStatusCard } from "../components/invoice-status-card";
import { LatestInvoices } from "../components/latest-invoices";
import { useDashboardOverview } from "../hooks/use-dashboard-overview";

export function DashboardOverviewView() {
  const { data, isLoading, isError } = useDashboardOverview();

  if (isLoading || !data) {
    return (
      <div className="text-sm text-muted-foreground">Loading dashboard…</div>
    );
  }

  if (isError) {
    return (
      <div className="text-sm text-red-600">
        Couldn&apos;t load the dashboard. Please try again shortly.
      </div>
    );
  }
  const { stats, revenue, invoiceStatusBreakdown, latestInvoices } = data;

  return (
    <div className="space-y-6">
      <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {stats.map((stat) => (
          <DashboardStatCard key={stat.id} stat={stat} />
        ))}
      </section>
      <section className="grid min-w-0 gap-6 xl:grid-cols-[minmax(0,2fr)_minmax(320px,1fr)]">
        <RevenueOverviewChart data={revenue} />
        <InvoiceStatusCard data={invoiceStatusBreakdown} />
      </section>

      <section>
        <LatestInvoices invoices={latestInvoices}></LatestInvoices>
      </section>
    </div>
  );
}
