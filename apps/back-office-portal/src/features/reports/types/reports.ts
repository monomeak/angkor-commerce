import { InvoiceStatus } from "../../invoices/types/invoice";

export type MonthlyStatusBreakdown = Record<InvoiceStatus, number> & {
  month: string;
};

export interface TopCustomerRevenue {
  userId: number;
  totalRevenue: number;
  invoiceCount: number;
}
export interface TopCustomerWithDetails extends TopCustomerRevenue {
  fullName: string;
  email: string;
  avatarUrl: string;
  company: string;
}
