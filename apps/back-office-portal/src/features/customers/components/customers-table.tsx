"use client";

import { useTranslations } from "next-intl";
import { ArrowDown, ArrowUp, ChevronsUpDown, Eye, Mail } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { formatDate } from "@/lib/formatters";
import { cn } from "@/lib/utils";
import { CustomerAvatar } from "./customer-avatar";
import { CustomerStatusBadge } from "./customer-status-badge";
import type { Customer, CustomerListParams, CustomerSortField, SortOrder } from "../types/customer";

interface CustomersTableProps {
    readonly customers: Customer[];
    readonly params: CustomerListParams;
    readonly isLoading: boolean;
    /** Dims the table while a filter or page change is in flight. */
    readonly isFetching: boolean;
    readonly onSort: (sortBy: CustomerSortField, order: SortOrder) => void;
    readonly onViewDetails: (customerId: number) => void;
}

/**
 * Sorting, filtering and paging are all server-side through the URL, so the headers only
 * report the current sort and ask for a new one — the rows are rendered in the order the API
 * returned them and are never re-sorted here.
 */
export function CustomersTable({
    customers,
    params,
    isLoading,
    isFetching,
    onSort,
    onViewDetails
}: CustomersTableProps) {
    const t = useTranslations("Customers");

    const statusLabel: Record<Customer["status"], string> = {
        active: t("active"),
        inactive: t("inactive"),
        deleted: t("archived")
    };

    return (
        <div className={cn("transition-opacity", isFetching && !isLoading && "opacity-60")}>
            <Table>
                <TableHeader>
                    <TableRow>
                        <SortableHead field="firstName" params={params} onSort={onSort}>
                            {t("colCustomer")}
                        </SortableHead>
                        <SortableHead field="email" params={params} onSort={onSort} className="w-[240px]">
                            {t("colEmail")}
                        </SortableHead>
                        <TableHead>{t("colPhone")}</TableHead>
                        <SortableHead field="companyName" params={params} onSort={onSort}>
                            {t("colCompany")}
                        </SortableHead>
                        <TableHead>{t("colStatus")}</TableHead>
                        <SortableHead field="createdAt" params={params} onSort={onSort}>
                            {t("colJoined")}
                        </SortableHead>
                        <TableHead className="w-10" />
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

                    {!isLoading && customers.length === 0 && (
                        <TableRow>
                            <TableCell colSpan={7} className="py-8 text-center text-sm text-muted-foreground">
                                {t("empty")}
                            </TableCell>
                        </TableRow>
                    )}

                    {customers.map((customer) => (
                        <TableRow key={customer.id} className={customer.status === "deleted" ? "opacity-60" : undefined}>
                            <TableCell>
                                <div className="flex items-center gap-3">
                                    <CustomerAvatar
                                        image={customer.image}
                                        displayName={customer.displayName}
                                        initials={customer.initials}
                                        className="size-9"
                                    />
                                    <span className="font-medium">{customer.displayName}</span>
                                </div>
                            </TableCell>
                            <TableCell className="max-w-[240px] text-sm text-muted-foreground">
                                <div className="flex min-w-0 items-center gap-1.5">
                                    <Mail className="size-3.5 shrink-0" />
                                    <a
                                        href={`mailto:${customer.email}`}
                                        title={customer.email}
                                        className="truncate hover:text-foreground hover:underline"
                                    >
                                        {customer.email}
                                    </a>
                                </div>
                            </TableCell>
                            <TableCell className="text-sm text-muted-foreground">{customer.phone ?? "—"}</TableCell>
                            <TableCell className="text-sm">{customer.companyName ?? "—"}</TableCell>
                            <TableCell>
                                <CustomerStatusBadge status={customer.status} label={statusLabel[customer.status]} />
                            </TableCell>
                            <TableCell className="text-sm text-muted-foreground">
                                {formatDate(customer.createdAt)}
                            </TableCell>
                            <TableCell>
                                <Button
                                    variant="ghost"
                                    size="icon"
                                    aria-label={t("viewDetailsFor", { name: customer.displayName })}
                                    onClick={() => onViewDetails(customer.id)}
                                >
                                    <Eye className="size-4" />
                                </Button>
                            </TableCell>
                        </TableRow>
                    ))}
                </TableBody>
            </Table>
        </div>
    );
}

type SortableHeadProps = {
    readonly field: CustomerSortField;
    readonly params: CustomerListParams;
    readonly onSort: (sortBy: CustomerSortField, order: SortOrder) => void;
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
                // Clicking the active column flips direction; a new column starts ascending.
                onClick={() => onSort(field, isActive && params.order === "asc" ? "desc" : "asc")}
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
