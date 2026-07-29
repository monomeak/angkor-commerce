import {
  BarChart3,
  Clock3,
  FileText,
  ReceiptText,
  ShieldCheck,
} from "lucide-react";

export const navItems = [
  { label: "Product", href: "#preview" },
  { label: "Features", href: "#features" },
  { label: "Pricing", href: "#pricing" },
  { label: "Solutions", href: "#solutions" },
  { label: "Clients", href: "#clients" },
];

export const proofPoints = [
  "No credit card",
  "Setup in 2 minutes",
  "Cancel anytime",
];

export const trustedClients = [
  "Northstar",
  "Vertex",
  "MONOLITH",
  "Brightline",
  "Acme",
];

export const features = [
  {
    icon: ReceiptText,
    title: "Effortless invoicing",
    description:
      "Create polished invoices in seconds and keep every client detail in one place.",
  },
  {
    icon: BarChart3,
    title: "Clear business insights",
    description:
      "See revenue, outstanding payments, and cash flow without wrestling with spreadsheets.",
  },
  {
    icon: ShieldCheck,
    title: "Built for confidence",
    description:
      "Reliable workflows and organized records help you stay ready for every deadline.",
  },
];

export const solutions = [
  {
    icon: FileText,
    title: "Invoice management",
    description:
      "Create, send, and follow every invoice from draft to paid without losing the client context.",
  },
  {
    icon: Clock3,
    title: "Payment follow-up",
    description:
      "Spot pending work, overdue balances, and next actions before they become a cash-flow problem.",
  },
  {
    icon: BarChart3,
    title: "Revenue visibility",
    description:
      "Turn daily billing activity into clear revenue, collection, and outstanding-payment signals.",
  },
];

export const invoices = [
  { name: "Acme Studios", id: "INV-2048", amount: "$2,840.00", status: "Paid" },
  {
    name: "Northstar Labs",
    id: "INV-2047",
    amount: "$1,260.00",
    status: "Pending",
  },
  { name: "Vertex Works", id: "INV-2046", amount: "$3,120.00", status: "Paid" },
];

export const revenueBars = [35, 55, 42, 70, 58, 82, 68, 92, 76, 100, 86, 110];

export const clients = [
  {
    name: "Northstar Labs",
    industry: "Product studio",
    quote: "Acme keeps our billing rhythm clear without adding more admin.",
    metric: "42 invoices tracked",
  },
  {
    name: "Vertex Works",
    industry: "Operations consulting",
    quote:
      "The dashboard gives our team one reliable place for client payments.",
    metric: "$38k collected",
  },
  {
    name: "Brightline Co.",
    industry: "Creative agency",
    quote:
      "We can see overdue work quickly and follow up before it slows us down.",
    metric: "9 hours saved",
  },
  {
    name: "Monolith Supply",
    industry: "Wholesale team",
    quote:
      "Invoice records stay tidy across repeat customers and month-end reviews.",
    metric: "31 active clients",
  },
  {
    name: "Acme Studios",
    industry: "Design partner",
    quote:
      "Simple enough for daily use, detailed enough for the finance check-in.",
    metric: "98% paid on time",
  },
];

export type Client = (typeof clients)[number];
