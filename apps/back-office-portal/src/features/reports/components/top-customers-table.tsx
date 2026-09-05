"use client";

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

import type { TopCustomerWithDetails } from "../types/reports";
import { getInitials } from "@/src/shared/lib/get-initial";
import { CustomerAvatar } from "../../customers/components/customer-avatar";
import { formatCurrency } from "../lib/format";

interface TopCustomersTableProps {
  readonly customers: TopCustomerWithDetails[];
  readonly isLoading: boolean;
}

export function TopCustomersTable({
  customers,
  isLoading,
}: TopCustomersTableProps) {
  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Customer</TableHead>

          <TableHead>Company</TableHead>

          <TableHead className="text-right">Invoices</TableHead>

          <TableHead className="text-right">Total revenue</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {isLoading && (
          <TableRow>
            <TableCell
              colSpan={4}
              className="py-8 text-center text-sm text-muted-foreground"
            >
              Loading top customers...
            </TableCell>
          </TableRow>
        )}

        {!isLoading && customers.length === 0 && (
          <TableRow>
            <TableCell
              colSpan={4}
              className="py-8 text-center text-sm text-muted-foreground"
            >
              No invoice data yet.
            </TableCell>
          </TableRow>
        )}

        {customers.map((customer) => (
          <TableRow key={customer.userId}>
            <TableCell>
              <div className="flex items-center gap-3">
                <CustomerAvatar
                  image={customer.avatarUrl || null}
                  displayName={customer.fullName}
                  initials={getInitials(customer.fullName)}
                  className="size-9"
                />
                <div className="flex flex-col">
                  <span className="font-medium">{customer.fullName}</span>
                  <span className="text-xs text-muted-foreground">
                    {customer.email}
                  </span>
                </div>
              </div>
            </TableCell>
            <TableCell className="text-sm text-muted-foreground">
              {customer.company}
            </TableCell>
            <TableCell className="text-right text-sm">
              {customer.invoiceCount}
            </TableCell>
            <TableCell className="text-right font-medium">
              {formatCurrency(customer.totalRevenue)}
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}
