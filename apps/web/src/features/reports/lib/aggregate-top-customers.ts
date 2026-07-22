import { Invoice } from "../../invoices/types/invoice";
import { TopCustomerRevenue } from "../types/reports";

export function aggregateTopCustomer(
  invoices: Invoice[],
  limit = 5,
): TopCustomerRevenue[] {
  const totals = new Map<number, TopCustomerRevenue>();

  for (const invoice of invoices) {
    const userId = invoice.client.userId!!;
    const existing = totals.get(userId) ?? {
      userId,
      totalRevenue: 0,
      invoiceCount: 0,
    };

    existing.totalRevenue += invoice.amountDue;
    existing.invoiceCount += 1;
    totals.set(userId, existing);
  }
  return Array.from(totals.values())
    .sort((a, b) => b.totalRevenue - a.totalRevenue)
    .slice(0, limit);
}
