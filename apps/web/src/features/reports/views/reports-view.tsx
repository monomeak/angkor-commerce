"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

import { StatusByMonthChart } from "../components/status-by-month-chart";
import { TopCustomersTable } from "../components/top-customers-table";
import { useStatusByMonth } from "../hooks/use-status-by-month";
import { useTopCustomers } from "../hooks/use-top-customers";
import { ExportCsvButton } from "@/src/shared/components/export-csv-button";

export function ReportsView() {
  const { data: statusByMonth, isLoading: statusLoading } = useStatusByMonth();
  const { data: topCustomers, isLoading: customersLoading } = useTopCustomers();
  const statusCsvRows = statusByMonth.map((m) => [
    m.month,
    m.paid.toFixed(2),
    m.pending.toFixed(2),
    m.overdue.toFixed(2),
    m.draft.toFixed(2),
  ]);

  const topCustomersCsvRows = topCustomers.map((c) => [
    c.fullName,
    c.email,
    c.company,
    c.invoiceCount,
    c.totalRevenue.toFixed(2),
  ]);
  const monthlyReportHeaders = ["Month", "Paid", "Pending", "Overdue", "Draft"];
  const topCustomerHeaders = [
    "Name",
    "Email",
    "Company",
    "Invoice",
    "Total revenue",
  ];

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="text-base font-semibold">
            Invoice status by month
          </CardTitle>

          <ExportCsvButton
            filename="invoice-status-by-month.csv"
            headers={monthlyReportHeaders}
            rows={statusCsvRows}
            disabled={statusLoading}
          ></ExportCsvButton>
        </CardHeader>

        <CardContent>
          <StatusByMonthChart
            data={statusByMonth}
            isLoading={statusLoading}
          ></StatusByMonthChart>
        </CardContent>
      </Card>
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="text-base font-semibold">
            Top customers by revenue
          </CardTitle>
          <ExportCsvButton
            filename="top-customers.csv"
            headers={topCustomerHeaders}
            rows={topCustomersCsvRows}
            disabled={customersLoading}
          ></ExportCsvButton>
        </CardHeader>
        <CardContent className="p-0">
          <TopCustomersTable
            customers={topCustomers}
            isLoading={customersLoading}
          />
        </CardContent>
      </Card>
    </div>
  );
}
