"use client";

import Link from "next/link";
import { useTranslations } from "next-intl";
import { ArrowUpRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { formatDate, formatMoney } from "@/lib/formatters";
import { InvoiceStatusBadge } from "../../invoices/components/invoice-status-badge";
import type { RecentInvoice } from "../types/dashboard";

interface LatestInvoicesProps {
    readonly invoices: RecentInvoice[];
}

/**
 * Reuses the invoice feature's badge rather than keeping a second one here — it is the same
 * status vocabulary, including the overdue rule, and two copies would drift.
 */
export function LatestInvoices({ invoices }: LatestInvoicesProps) {
    const t = useTranslations("Overview");
    const tInvoices = useTranslations("Invoices");

    const statusLabels: Record<string, string> = {
        ISSUED: tInvoices("status_ISSUED"),
        PARTIALLY_PAID: tInvoices("status_PARTIALLY_PAID"),
        PAID: tInvoices("status_PAID"),
        CANCELLED: tInvoices("status_CANCELLED"),
        OVERDUE: tInvoices("status_OVERDUE")
    };

    return (
        <Card>
            <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle className="text-base font-semibold">{t("latestInvoices")}</CardTitle>
                <Button nativeButton={false} render={<Link href="/invoices" />} variant="ghost" size="sm">
                    {t("viewAll")}
                    <ArrowUpRight className="h-3.5 w-3.5" />
                </Button>
            </CardHeader>
            <CardContent>
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>{tInvoices("colInvoice")}</TableHead>
                            <TableHead>{tInvoices("colCustomer")}</TableHead>
                            <TableHead>{tInvoices("colDue")}</TableHead>
                            <TableHead>{tInvoices("colStatus")}</TableHead>
                            <TableHead className="text-right">{tInvoices("colTotal")}</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {invoices.length === 0 && (
                            <TableRow>
                                <TableCell colSpan={5} className="py-8 text-center text-sm text-muted-foreground">
                                    {t("noInvoices")}
                                </TableCell>
                            </TableRow>
                        )}

                        {invoices.map((invoice) => (
                            <TableRow key={invoice.id}>
                                <TableCell>
                                    <Link href={`/invoices/${invoice.id}`} className="font-medium hover:underline">
                                        {invoice.invoiceNumber}
                                    </Link>
                                </TableCell>
                                <TableCell className="text-sm">{invoice.customerName}</TableCell>
                                <TableCell className="text-sm text-muted-foreground">
                                    {formatDate(invoice.dueDate)}
                                </TableCell>
                                <TableCell>
                                    <InvoiceStatusBadge
                                        status={invoice.invoiceStatus}
                                        dueDate={invoice.dueDate}
                                        balance={invoice.balance}
                                        labels={statusLabels}
                                    />
                                </TableCell>
                                <TableCell className="text-right font-medium">
                                    {formatMoney(invoice.total, invoice.currency)}
                                </TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </CardContent>
        </Card>
    );
}
