import { InvoiceStatus } from "../types/dashboard";

interface StatusStyle {
  label: string;
  badgeClassName: string;
  dotClassName: string;
}
const STATUS_STYLES: Record<InvoiceStatus, StatusStyle> = {
  paid: {
    label: "Paid",
    badgeClassName:
      "bg-emerald-50 text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-400",
    dotClassName: "bg-emerald-500",
  },
  pending: {
    label: "Pending",
    badgeClassName:
      "bg-amber-50 text-amber-700 dark:bg-amber-500/10 dark:text-amber-400",
    dotClassName: "bg-amber-500",
  },
  overdue: {
    label: "Overdue",
    badgeClassName:
      "bg-red-50 text-red-700 dark:bg-red-500/10 dark:text-red-400",
    dotClassName: "bg-red-500",
  },
  draft: {
    label: "Draft",
    badgeClassName:
      "bg-slate-100 text-slate-600 dark:bg-slate-500/10 dark:text-slate-400",
    dotClassName: "bg-slate-400",
  },
};

export function getStatusStyle(status: InvoiceStatus): StatusStyle {
  return STATUS_STYLES[status];
}
