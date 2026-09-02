import type { LucideIcon } from "lucide-react";
import type { Invoice, InvoiceStatus } from "../../invoices/mock/types";

export type DashboardStatKey =
  | "totalRevenue"
  | "outstanding"
  | "pendingInvoices"
  | "overdueInvoices";

export interface DashboardStat {
  id: string;
  key: DashboardStatKey;
  label: string;
  value: string;
  change: {
    value: string;
    direction: "up" | "down";
  };
  icon: LucideIcon;
}

export interface RevenuePoint {
  month: string;
  paid: number;
  pending: number;
}

export interface InvoiceStatusBreakdown {
  status: InvoiceStatus;
  label: string;
  count: number;
  amount: number;
  percentage: number;
}

// export interface InvoiceClient {
//   name: string;
//   email: string;
//   avatarUrl?: string;
// }
// export interface Invoice {
//   id: string;
//   invoiceNumber: string;
//   client: InvoiceClient;
//   amount: number;
//   status: InvoiceStatus;
//   issuedDate: string;
//   dueDate: string;
// }
export interface DashboardOverviewData {
  stats: DashboardStat[];
  revenue: RevenuePoint[];
  invoiceStatusBreakdown: InvoiceStatusBreakdown[];
  latestInvoices: Invoice[];
}
