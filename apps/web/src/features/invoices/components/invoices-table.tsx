"use client";
import { Eye } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  formatCurrency,
  formatDate,
} from "../../dashboard-overview/lib/format";
import { InvoiceStatusBadge } from "./invoice-status-badge";
import type { Invoice } from "../types/invoice";

interface InvoicesTableProps {
  readonly invoices: Invoice[];
  readonly isLoading: boolean;
  onViewDetails: (invoiceId: string) => void;
}

export function InvoicesTable({
  invoices,
  isLoading,
  onViewDetails,
}: InvoicesTableProps) {
  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Invoice</TableHead>
          <TableHead className="w-[220px]">Client</TableHead>
          <TableHead>Items</TableHead>
          <TableHead>Issued</TableHead>
          <TableHead>Due Date</TableHead>
          <TableHead>Status</TableHead>
          <TableHead className="text-right">Amount</TableHead>
          <TableHead className="w-10"></TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {isLoading && (
          <TableRow>
            <TableCell
              colSpan={8}
              className="py-8 text-center text-sm text-muted-foreground"
            >
              {" "}
              Loading Invoices...
            </TableCell>
          </TableRow>
        )}

        {!isLoading && invoices.length === 0 && (
          <TableRow>
            <TableCell
              colSpan={8}
              className="py-8 text-center text-sm text-muted-foreground"
            >
              {" "}
              Invoices not found...
            </TableCell>
          </TableRow>
        )}

        {invoices.map((inv) => (
          <TableRow key={inv.id}>
            <TableCell className="font-medium">{inv.invoiceNumber}</TableCell>
            <TableCell className="max-w-[220px]">
              <div className="min-w-0 space-y-1">
                <div className="flex min-w-0 items-center gap-1.5">
                  <span className="truncate text-sm font-medium">
                    {inv.client.name}
                  </span>
                </div>
                <div className="flex min-w-0 items-center gap-1.5 text-muted-foreground">
                  <span className="truncate text-xs" title={inv.client.email}>
                    {inv.client.email}
                  </span>
                </div>
              </div>
            </TableCell>
            <TableCell className="text-sm text-muted-foreground">
              {inv.totalProducts} item{inv.totalProducts === 1 ? "" : "s"}
            </TableCell>

            <TableCell className="text-sm text-muted-foreground">
              {formatDate(inv.issuedDate)}
            </TableCell>
            <TableCell className="text-sm text-muted-foreground">
              {formatDate(inv.dueDate)}
            </TableCell>
            <TableCell>
              <InvoiceStatusBadge status={inv.status} />
            </TableCell>
            <TableCell className="text-right font-medium">
              {formatCurrency(inv.amountDue)}
            </TableCell>

            <TableCell>
              <Button
                variant="ghost"
                size="icon"
                aria-label={`View details of ${inv.invoiceNumber}`}
                onClick={() => onViewDetails(inv.id)}
              >
                <Eye className="size-4"></Eye>
              </Button>
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}
