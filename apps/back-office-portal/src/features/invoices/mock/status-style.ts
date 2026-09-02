import { InvoiceStatus } from "./types";

interface StatusStyle {
  label: string;
  badgeClassName: string;
  dotClassName: string;
  chartColor: string;
}
const STATUS_STYLES: Record<InvoiceStatus, StatusStyle> = {
  paid: {
    label: "Paid",
    badgeClassName:
      "bg-emerald-50 text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-400",
    dotClassName: "bg-emerald-500",
    chartColor: "#10b981",
  },
  pending: {
    label: "Pending",
    badgeClassName:
      "bg-amber-50 text-amber-700 dark:bg-amber-500/10 dark:text-amber-400",
    dotClassName: "bg-amber-500",
    chartColor: "#f59e0b",
  },
  overdue: {
    label: "Overdue",
    badgeClassName:
      "bg-red-50 text-red-700 dark:bg-red-500/10 dark:text-red-400",
    dotClassName: "bg-red-500",
    chartColor: "#ef4444",
  },
  draft: {
    label: "Draft",
    badgeClassName:
      "bg-slate-100 text-slate-600 dark:bg-slate-500/10 dark:text-slate-400",
    dotClassName: "bg-slate-400",
    chartColor: "#94a3b8",
  },
};

export function getStatusStyle(status: InvoiceStatus): StatusStyle {
  return STATUS_STYLES[status];
}

export const ALL_INVOICE_STATUSES: InvoiceStatus[] = [
  "paid",
  "pending",
  "overdue",
  "draft",
];
