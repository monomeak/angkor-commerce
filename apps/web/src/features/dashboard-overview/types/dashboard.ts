import type { LucideIcon } from "lucide-react";
import { Invoice, InvoiceStatus } from "../../invoices/types/invoice";

export interface DashboardStat {
  id: string;
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
