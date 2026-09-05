"use client";

import {
  Bar,
  BarChart,
  CartesianGrid,
  Legend,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

import type { MonthlyStatusBreakdown } from "../types/reports";
import { formatCurrency } from "../lib/format";
import {
  ALL_INVOICE_STATUSES,
  getStatusStyle,
} from "../../invoices/mock/status-style";
import { InvoiceStatus } from "../../invoices/mock/types";
import { readonly } from "zod";

interface StatusByMonthChartProps {
  readonly data: MonthlyStatusBreakdown[];
  readonly isLoading: boolean;
}
export function StatusByMonthChart({
  data,
  isLoading,
}: StatusByMonthChartProps) {
  if (isLoading) {
    return (
      <div className="flex h-[320px] items-center justify-center text-sm text-muted-foreground">
        Loading chart...
      </div>
    );
  }

  if (data.length === 0) {
    return (
      <div className="flex h-[320px] items-center justify-center text-sm text-muted-foreground">
        No invoice data yet.
      </div>
    );
  }
  return (
    <div className="h-[320px] w-full">
      <ResponsiveContainer
        width="100%"
        height="100%"
        minWidth={0}
        initialDimension={{ width: 800, height: 280 }}
      >
        <BarChart data={data} margin={{ top: 8, right: 8, left: 0, bottom: 0 }}>
          <CartesianGrid
            vertical={false}
            strokeDasharray="3 3"
            className="stroke-muted"
          />
          <XAxis
            dataKey="month"
            axisLine={false}
            tickLine={false}
            className="text-xs fill-muted-foreground"
          />
          <YAxis
            axisLine={false}
            tickLine={false}
            width={56}
            tickFormatter={(v) => `$${v / 1000}k`}
            className="text-xs fill-muted-foreground"
          />
          <Tooltip
            formatter={(value, name) => [
              formatCurrency(Number(value ?? 0)),
              getStatusStyle(String(name) as InvoiceStatus).label,
            ]}
            contentStyle={{ borderRadius: 8 }}
          />
          <Legend
            formatter={(value) => getStatusStyle(value as InvoiceStatus).label}
          />
          {ALL_INVOICE_STATUSES.map((status) => (
            <Bar
              key={status}
              dataKey={status}
              stackId="status"
              fill={getStatusStyle(status).chartColor}
            />
          ))}
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
