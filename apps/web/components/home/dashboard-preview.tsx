import {
  CircleDollarSign,
  Clock3,
  FileCheck2,
  FileText,
  LayoutDashboard,
  MoreHorizontal,
  TrendingUp,
  Users,
  type LucideIcon,
} from "lucide-react";

import { AcmeLogo } from "@/components/acme-logo";
import { invoices, revenueBars } from "@/components/home/data";

export function DashboardPreview() {
  return (
    <div
      id="preview"
      className="relative mx-auto w-full max-w-2xl scroll-mt-24"
    >
      <div className="absolute -inset-5 -z-10 rounded-[2rem] bg-muted/60 blur-2xl" />
      <div className="overflow-hidden rounded-2xl border bg-card shadow-2xl shadow-foreground/10">
        <DashboardBrowserBar />
        <div className="grid min-h-[420px] grid-cols-[56px_1fr] sm:grid-cols-[150px_1fr]">
          <DashboardSidebar />
          <DashboardContent />
        </div>
      </div>
    </div>
  );
}

function DashboardBrowserBar() {
  return (
    <div className="flex h-12 items-center justify-between border-b px-4">
      <div className="flex items-center gap-2">
        <span className="size-2 rounded-full bg-foreground/20" />
        <span className="size-2 rounded-full bg-foreground/20" />
        <span className="size-2 rounded-full bg-foreground/20" />
      </div>
      <span className="text-[10px] font-medium text-muted-foreground">
        acme.app/dashboard
      </span>
      <MoreHorizontal className="size-4 text-muted-foreground" />
    </div>
  );
}

function DashboardSidebar() {
  return (
    <aside className="border-r bg-muted/30 p-3">
      <AcmeLogo className="mb-6 hidden px-1 sm:inline-flex" size="sm" />
      <div className="space-y-1 text-[11px]">
        <div className="flex items-center gap-2 rounded-md bg-background px-2 py-2 font-medium shadow-sm">
          <LayoutDashboard className="size-3.5" />
          <span className="hidden sm:inline">Overview</span>
        </div>
        <div className="flex items-center gap-2 px-2 py-2 text-muted-foreground">
          <FileText className="size-3.5" />
          <span className="hidden sm:inline">Invoices</span>
        </div>
        <div className="flex items-center gap-2 px-2 py-2 text-muted-foreground">
          <Users className="size-3.5" />
          <span className="hidden sm:inline">Customers</span>
        </div>
      </div>
    </aside>
  );
}

function DashboardContent() {
  return (
    <div className="min-w-0 p-4 sm:p-6">
      <DashboardGreeting />
      <DashboardStats />
      <RevenueChart />
      <RecentInvoices />
    </div>
  );
}

function DashboardGreeting() {
  return (
    <div className="flex items-center justify-between">
      <div>
        <p className="text-[10px] text-muted-foreground">Tuesday, July 14</p>
        <h3 className="mt-1 text-sm font-semibold sm:text-base">
          Good morning, Alex
        </h3>
      </div>
      <div className="flex size-7 items-center justify-center rounded-full bg-primary text-[9px] font-semibold text-primary-foreground">
        AM
      </div>
    </div>
  );
}

function DashboardStats() {
  return (
    <div className="mt-5 grid grid-cols-2 gap-2 sm:grid-cols-3">
      <MiniStat
        icon={CircleDollarSign}
        label="Revenue"
        value="$24,560"
        detail="+12.5%"
      />
      <MiniStat
        icon={Clock3}
        label="Outstanding"
        value="$4,230"
        detail="3 invoices"
      />
      <MiniStat
        className="hidden sm:block"
        icon={FileCheck2}
        label="Paid"
        value="18"
        detail="This month"
      />
    </div>
  );
}

function RevenueChart() {
  return (
    <div className="mt-3 rounded-xl border p-3 sm:p-4">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-[10px] text-muted-foreground">Revenue</p>
          <p className="mt-1 text-sm font-semibold">$18,420</p>
        </div>
        <span className="flex items-center gap-1 text-[9px] font-medium">
          <TrendingUp className="size-3" /> +8.2%
        </span>
      </div>
      <div className="mt-4 flex h-20 items-end gap-1.5 sm:gap-2">
        {revenueBars.map((height, index) => (
          <span
            key={index}
            className="flex-1 rounded-sm bg-primary/15 last:bg-primary"
            style={{ height: `${height / 1.25}%` }}
          />
        ))}
      </div>
    </div>
  );
}

function RecentInvoices() {
  return (
    <div className="mt-3 overflow-hidden rounded-xl border">
      <div className="flex items-center justify-between border-b px-3 py-2.5">
        <p className="text-[10px] font-semibold">Recent invoices</p>
        <span className="text-[9px] text-muted-foreground">View all</span>
      </div>
      {invoices.map((invoice) => (
        <div
          key={invoice.id}
          className="grid grid-cols-[1fr_auto] items-center gap-2 border-b px-3 py-2 last:border-0 sm:grid-cols-[1fr_70px_75px]"
        >
          <div className="min-w-0">
            <p className="truncate text-[10px] font-medium">{invoice.name}</p>
            <p className="text-[8px] text-muted-foreground">{invoice.id}</p>
          </div>
          <span className="hidden text-[9px] sm:block">{invoice.amount}</span>
          <span className="rounded-full bg-muted px-2 py-1 text-center text-[8px] font-medium">
            {invoice.status}
          </span>
        </div>
      ))}
    </div>
  );
}

function MiniStat({
  icon: Icon,
  label,
  value,
  detail,
  className = "",
}: {
  icon: LucideIcon;
  label: string;
  value: string;
  detail: string;
  className?: string;
}) {
  return (
    <div className={`rounded-xl border bg-background p-3 ${className}`}>
      <div className="flex items-center justify-between">
        <span className="text-[9px] text-muted-foreground">{label}</span>
        <Icon className="size-3 text-muted-foreground" />
      </div>
      <p className="mt-2 text-sm font-semibold">{value}</p>
      <p className="mt-0.5 text-[8px] text-muted-foreground">{detail}</p>
    </div>
  );
}
