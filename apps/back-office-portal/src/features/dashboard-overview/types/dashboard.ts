import type { LucideIcon } from "lucide-react";
import type { InvoiceStatus } from "../../invoices/types/invoice";

/**
 * The overview's shapes, mapped from core-api's DashboardOverviewResponse — one call behind
 * four widgets. Nothing here is derived from the invoice list any more; the aggregates are
 * computed in SQL, so the screen no longer depends on having every invoice in memory.
 */

export interface DashboardSummary {
    /** Money received: the sum of COMPLETED payments. */
    totalRevenue: number;
    /** Money owed: the balance of every unpaid or part-paid invoice. */
    outstandingAmount: number;
    currency: string;
    totalProducts: number;
    totalCustomers: number;
    /** Orders placed but not paid for — the only KPI that is a to-do rather than a total. */
    pendingOrders: number;
    totalInvoices: number;
}

/** One month of received payments. `month` is "YYYY-MM". */
export interface RevenuePoint {
    month: string;
    revenue: number;
}

export interface InvoiceStatusBreakdown {
    status: InvoiceStatus;
    count: number;
    amount: number;
}

export interface RecentInvoice {
    id: number;
    invoiceNumber: string;
    customerId: number;
    customerName: string;
    invoiceStatus: InvoiceStatus;
    issueDate: string;
    dueDate: string;
    total: number;
    balance: number;
    currency: string;
}

export interface DashboardOverview {
    summary: DashboardSummary;
    revenueByMonth: RevenuePoint[];
    invoiceStatusBreakdown: InvoiceStatusBreakdown[];
    recentInvoices: RecentInvoice[];
}

/** A KPI card, built from the summary in lib/stats.ts. */
export interface DashboardStat {
    /** Key into the `Overview` message namespace. */
    key: string;
    value: string;
    icon: LucideIcon;
    /**
     * Only revenue carries one: it is the only KPI with a comparable previous period in the
     * data we have. A count of products has nothing honest to compare against.
     */
    change?: {
        value: string;
        direction: "up" | "down";
    };
}
