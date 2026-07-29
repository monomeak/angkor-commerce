export type InvoiceStatus = "paid" | "pending" | "overdue" | "draft";

export interface InvoiceProductLine {
  id: string;
  title: string;
  thumbnail: string;
  price: number;
  quantity: number;
  total: number;
  discountPercentage: number;
  discountedTotal: number;
}

export interface InvoiceClient {
  userId?: number;
  /** Placeholder display name — DummyJSON carts only expose a userId, not a real client record. */
  name: string;
  email: string;
}

export interface Invoice {
  id: string;
  invoiceNumber: string;
  client: InvoiceClient;
  products?: InvoiceProductLine[];
  totalProducts?: number;
  totalQuantity?: number;
  /** Sum before discount */
  amount: number;
  /** Amount actually invoiced, after discount */
  totalDiscount: number;
  amountDue: number;
  status: InvoiceStatus;
  issuedDate: string;
  dueDate: string;
}

export interface InvoiceListFilters {
  search: string;
  status: InvoiceStatus | "all";
  issuedDateFrom: string;
  issuedDateTo: string;
  dueDateFrom: string;
  dueDateTo: string;
  page: number;
  pageSize: number;
}
