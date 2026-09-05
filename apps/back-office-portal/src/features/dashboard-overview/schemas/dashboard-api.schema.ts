import { z } from "zod";

import { invoiceStatusSchema } from "../../invoices/schemas/invoice-api.schema";

/** Wire shapes for `GET /dashboard/overview`, exactly as core-api serialises them. */
export const dashboardSummaryDtoSchema = z.object({
    totalRevenue: z.number(),
    outstandingAmount: z.number(),
    currency: z.string(),
    totalProducts: z.number(),
    totalCustomers: z.number(),
    pendingOrders: z.number(),
    totalInvoices: z.number()
});

export const revenuePointDtoSchema = z.object({
    month: z.string(),
    revenue: z.number()
});

export const categorySalesDtoSchema = z.object({
    categoryId: z.number(),
    category: z.string(),
    slug: z.string(),
    unitsSold: z.number(),
    amount: z.number()
});

export const recentInvoiceDtoSchema = z.object({
    id: z.number(),
    invoiceNumber: z.string(),
    customerId: z.number(),
    customerName: z.string().nullable(),
    invoiceStatus: invoiceStatusSchema,
    issueDate: z.string(),
    dueDate: z.string(),
    total: z.number(),
    balance: z.number(),
    currency: z.string()
});

export const dashboardOverviewDtoSchema = z.object({
    summary: dashboardSummaryDtoSchema,
    revenueByMonth: z.array(revenuePointDtoSchema),
    salesByCategory: z.array(categorySalesDtoSchema),
    recentInvoices: z.array(recentInvoiceDtoSchema)
});

export type DashboardOverviewDto = z.infer<typeof dashboardOverviewDtoSchema>;
