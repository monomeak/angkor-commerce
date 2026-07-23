export interface MonthlyStatusPayload {
  month: string;
  paid: number;
  pending: number;
  overdue: number;
  draft: number;
}

export interface TopCustomerPayload {
  fullName: string;
  company: string;
  invoiceCount: number;
  totalRevenue: number;
}

export interface InsightsRequestPayload {
  statusByMonth: MonthlyStatusPayload[];
  topCustomers: TopCustomerPayload[];
}
export interface InsightsResult {
  insight: string;
}
