import { Invoice } from "../../invoices/mock/types";
import { MonthlyStatusBreakdown } from "../types/reports";

export function aggregateStatusByMonth(
  invoices: Invoice[],
): MonthlyStatusBreakdown[] {
  const buckets = new Map<string, MonthlyStatusBreakdown>();
  for (const invoice of invoices) {
    const date = new Date(invoice.issuedDate);
    const sortKey = `${date.getUTCFullYear()}-${String(date.getUTCMonth() + 1).padStart(2, "0")}`;
    const label = date.toLocaleString("en-US", {
      month: "short",
      year: "numeric",
      timeZone: "UTC",
    });
    if (!buckets.has(sortKey)) {
      buckets.set(sortKey, {
        month: label,
        paid: 0,
        pending: 0,
        overdue: 0,
        draft: 0,
      });
    }
    const bucket = buckets.get(sortKey)!;
    bucket[invoice.status] += invoice.amountDue;
  }

  return Array.from(buckets.entries())
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([, value]) => value);
}
