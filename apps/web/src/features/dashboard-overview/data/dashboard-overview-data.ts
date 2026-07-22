import { DollarSign, FileText, Clock, AlertTriangle } from "lucide-react";
import type { DashboardOverviewData } from "../types/dashboard";

/**
 * Static mock data for now. When a real endpoint exists, this file's
 * shape (DashboardOverviewData) becomes the contract a mapper/hook in
 * api/ + hooks/ should produce — components below never need to change.
 */
export const dashboardOverviewData: DashboardOverviewData = {
  stats: [
    {
      id: "total-revenue",
      label: "Total revenue",
      value: "$84,254.00",
      change: { value: "12.4%", direction: "up" },
      icon: DollarSign,
    },
    {
      id: "outstanding",
      label: "Outstanding",
      value: "$12,430.00",
      change: { value: "3.1%", direction: "down" },
      icon: FileText,
    },
    {
      id: "pending",
      label: "Pending invoices",
      value: "18",
      change: { value: "5.0%", direction: "up" },
      icon: Clock,
    },
    {
      id: "overdue",
      label: "Overdue invoices",
      value: "4",
      change: { value: "2.0%", direction: "down" },
      icon: AlertTriangle,
    },
  ],

  revenue: [
    { month: "Jan", paid: 18500, pending: 4200 },
    { month: "Feb", paid: 21200, pending: 3100 },
    { month: "Mar", paid: 19800, pending: 5400 },
    { month: "Apr", paid: 24600, pending: 2800 },
    { month: "May", paid: 27300, pending: 3900 },
    { month: "Jun", paid: 25100, pending: 4600 },
    { month: "Jul", paid: 29800, pending: 3200 },
  ],

  invoiceStatusBreakdown: [
    {
      status: "paid",
      label: "Paid",
      count: 128,
      amount: 84254,
      percentage: 62,
    },
    {
      status: "pending",
      label: "Pending",
      count: 34,
      amount: 21430,
      percentage: 24,
    },
    {
      status: "overdue",
      label: "Overdue",
      count: 9,
      amount: 8120,
      percentage: 9,
    },
    { status: "draft", label: "Draft", count: 6, amount: 3200, percentage: 5 },
  ],

  latestInvoices: [
    {
      id: "inv_1001",
      invoiceNumber: "INV-1001",
      client: { name: "Nova Retail Co.", email: "billing@novaretail.com" },
      amount: 2450,
      totalDiscount: 0,
      amountDue: 2450,
      status: "paid",
      issuedDate: "2026-07-01",
      dueDate: "2026-07-15",
    },
    {
      id: "inv_1002",
      invoiceNumber: "INV-1002",
      client: { name: "Bluepeak Studio", email: "accounts@bluepeak.io" },
      amount: 980,
      totalDiscount: 0,
      amountDue: 980,
      status: "pending",
      issuedDate: "2026-07-04",
      dueDate: "2026-07-18",
    },
    {
      id: "inv_1003",
      invoiceNumber: "INV-1003",
      client: { name: "Harbor & Finch", email: "finance@harborfinch.com" },
      amount: 5200,
      totalDiscount: 0,
      amountDue: 5200,
      status: "overdue",
      issuedDate: "2026-06-20",
      dueDate: "2026-07-05",
    },
    {
      id: "inv_1004",
      invoiceNumber: "INV-1004",
      client: { name: "Loop Logistics", email: "ap@looplogistics.com" },
      amount: 1330,
      totalDiscount: 0,
      amountDue: 1330,
      status: "paid",
      issuedDate: "2026-07-08",
      dueDate: "2026-07-22",
    },
    {
      id: "inv_1005",
      invoiceNumber: "INV-1005",
      client: { name: "Marrow Design", email: "hello@marrowdesign.co" },
      amount: 640,
      totalDiscount: 0,
      amountDue: 640,
      status: "draft",
      issuedDate: "2026-07-10",
      dueDate: "2026-07-24",
    },
  ],
};
