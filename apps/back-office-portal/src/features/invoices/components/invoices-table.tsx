"use client";

import Link from "next/link";
import { useTranslations } from "next-intl";
import { ArrowDown, ArrowUp, ChevronsUpDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { formatDate, formatMoney } from "@/lib/formatters";
import { cn } from "@/lib/utils";
import { InvoiceStatusBadge } from "./invoice-status-badge";
import type { InvoiceListParams, InvoiceSortField, InvoiceSummary, SortOrder } from "../types/invoice";

interface InvoicesTableProps {
    readonly invoices: InvoiceSummary[];
    readonly params: InvoiceListParams;
    readonly isLoading: boolean;
    /** Dims the table while a filter or page change is in flight. */
    readonly isFetching: boolean;
    readonly statusLabels: Record<string, string>;
    readonly onSort: (sortBy: InvoiceSortField, order: SortOrder) => void;
    readonly onFilterByCustomer: (customerId: number) => void;
}

/**
 * Rows link to the receipt rather than opening a dialog: a receipt is a document, so it gets
 * its own URL and prints on its own. Sorting and paging are server-side through the URL, so
 * the rows render in the order the API returned them and are never re-sorted here.
 */
export function InvoicesTable({
    invoices,
    params,
    isLoading,
    isFetching,
    statusLabels,
    onSort,
    onFilterByCustomer
}: InvoicesTableProps) {
    const t = useTranslations("Invoices");

    return (
        <div className={cn("transition-opacity", isFetching && !isLoading && "opacity-60")}>
            <Table>
                <TableHeader>
                    <TableRow>
                        <SortableHead field="invoiceNumber" params={params} onSort={onSort}>
                            {t("colInvoice")}
                        </SortableHead>
                        <TableHead>{t("colCustomer")}</TableHead>
                        <SortableHead field="issueDate" params={params} onSort={onSort}>
                            {t("colIssued")}
                        </SortableHead>
                        <SortableHead field="dueDate" params={params} onSort={onSort}>
                            {t("colDue")}
                        </SortableHead>
                        <SortableHead field="total" params={params} onSort={onSort} className="text-right">
                            {t("colTotal")}
                        </SortableHead>
                        <SortableHead field="balance" params={params} onSort={onSort} className="text-right">
                            {t("colBalance")}
                        </SortableHead>
                        <TableHead>{t("colStatus")}</TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {isLoading && (
                        <TableRow>
                            <TableCell colSpan={7} className="py-8 text-center text-sm text-muted-foreground">
                                {t("loading")}
                            </TableCell>
                        </TableRow>
                    )}

                    {!isLoading && invoices.length === 0 && (
                        <TableRow>
                            <TableCell colSpan={7} className="py-8 text-center text-sm text-muted-foreground">
                                {t("empty")}
                            </TableCell>
                        </TableRow>
                    )}

                    {invoices.map((invoice) => (
                        <TableRow key={invoice.id}>
                            <TableCell>
                                <Link
                                    href={`/invoices/${invoice.id}`}
                                    className="font-medium hover:underline"
                                    aria-label={t("openReceipt", { number: invoice.invoiceNumber })}
                                >
                                    {invoice.invoiceNumber}
                                </Link>
                            </TableCell>
                            <TableCell className="text-sm">
                                {/* Narrows the list to this customer rather than navigating away —
                                    the same "filter by what you clicked" move the product table makes. */}
                                <button
                                    type="button"
                                    className="text-left hover:underline"
                                    onClick={() => onFilterByCustomer(invoice.customerId)}
                                >
                                    {invoice.customerName}
                                </button>
                            </TableCell>
                            <TableCell className="text-sm text-muted-foreground">{formatDate(invoice.issueDate)}</TableCell>
                            <TableCell className="text-sm text-muted-foreground">{formatDate(invoice.dueDate)}</TableCell>
                            <TableCell className="text-right text-sm font-medium">
                                {formatMoney(invoice.total, invoice.currency)}
                            </TableCell>
                            <TableCell className="text-right text-sm">
                                {formatMoney(invoice.balance, invoice.currency)}
                            </TableCell>
                            <TableCell>
                                <InvoiceStatusBadge
                                    status={invoice.invoiceStatus}
                                    dueDate={invoice.dueDate}
                                    balance={invoice.balance}
                                    labels={statusLabels}
                                />
                            </TableCell>
                        </TableRow>
                    ))}
                </TableBody>
            </Table>
        </div>
    );
}

type SortableHeadProps = {
    readonly field: InvoiceSortField;
    readonly params: InvoiceListParams;
    readonly onSort: (sortBy: InvoiceSortField, order: SortOrder) => void;
    readonly className?: string;
    readonly children: React.ReactNode;
};

function SortableHead({ field, params, onSort, className, children }: SortableHeadProps) {
    const isActive = params.sortBy === field;

    return (
        <TableHead className={className}>
            <Button
                variant="ghost"
                size="sm"
                className="-ml-2 h-8"
                // Clicking the active column flips direction; a new column starts descending,
                // which is what you want for dates and money.
                onClick={() => onSort(field, isActive && params.order === "desc" ? "asc" : "desc")}
            >
                {children}
                {isActive ? (
                    params.order === "desc" ? (
                        <ArrowDown className="size-3.5" />
                    ) : (
                        <ArrowUp className="size-3.5" />
                    )
                ) : (
                    <ChevronsUpDown className="size-3.5 opacity-50" />
                )}
            </Button>
        </TableHead>
    );
}
