import { ArrowUpRight } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { InvoiceStatusBadge } from "./invoice-status-badge";
import { formatCurrency, formatDate } from "../lib/format";
import { Invoice } from "../../invoices/types/invoice";

interface LatestInvoicesProps {
  readonly invoices: Invoice[];
}

export function LatestInvoices({ invoices }: LatestInvoicesProps) {
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle className="text-base font-semibold">
          Latest invoices
        </CardTitle>
        <Button variant="ghost" size="sm" className="gap-1 text-sm">
          View all
          <ArrowUpRight className="h-3.5 w-3.5" />
        </Button>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Invoice</TableHead>
              <TableHead>Client</TableHead>
              <TableHead>Due date</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-right">Amount</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {invoices.map((invoice) => (
              <TableRow key={invoice.id}>
                <TableCell className="font-medium">
                  {invoice.invoiceNumber}
                </TableCell>
                <TableCell>
                  <div className="flex flex-col">
                    <span className="text-sm">{invoice.client.name}</span>
                    <span className="text-xs text-muted-foreground">
                      {invoice.client.email}
                    </span>
                  </div>
                </TableCell>
                <TableCell className="text-sm text-muted-foreground">
                  {formatDate(invoice.dueDate)}
                </TableCell>
                <TableCell>
                  <InvoiceStatusBadge status={invoice.status} />
                </TableCell>
                <TableCell className="text-right font-medium">
                  {formatCurrency(invoice.amount)}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}
