"use client";

import { flexRender, getCoreRowModel, useReactTable, type ColumnDef } from "@tanstack/react-table";
import { ArrowDown, ArrowUp, ChevronsUpDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { cn } from "@/lib/utils";
import { SORTABLE_FIELDS } from "../lib/constants";
import type { ProductListParams, ProductSortField, ProductSummary, SortOrder } from "../types/product";

type ProductTableProps = {
    readonly data: ProductSummary[];
    readonly columns: ColumnDef<ProductSummary>[];
    readonly params: ProductListParams;
    readonly onSort: (sortBy: ProductSortField, order: SortOrder) => void;
    /** Dims the table while a filter or page change is in flight. */
    readonly isFetching?: boolean;
};

function isSortable(columnId: string): columnId is ProductSortField {
    return SORTABLE_FIELDS.includes(columnId as ProductSortField);
}

/**
 * Only the core row model is wired up: filtering, sorting and pagination all happen on the
 * server via URL params, so registering the client-side row models would let the table
 * silently re-sort the current page and disagree with the URL.
 */
export function ProductTable({ data, columns, params, onSort, isFetching = false }: ProductTableProps) {
    const table = useReactTable({
        data,
        columns,
        getCoreRowModel: getCoreRowModel(),
        manualSorting: true,
        manualPagination: true,
        manualFiltering: true
    });

    return (
        <div className={cn("rounded-md border transition-opacity", isFetching && "opacity-60")}>
            <Table>
                <TableHeader>
                    {table.getHeaderGroups().map((headerGroup) => (
                        <TableRow key={headerGroup.id}>
                            {headerGroup.headers.map((header) => {
                                const columnId = header.column.id;
                                const sortable = isSortable(columnId);
                                const isActive = sortable && params.sortBy === columnId;
                                const content = header.isPlaceholder
                                    ? null
                                    : flexRender(header.column.columnDef.header, header.getContext());

                                return (
                                    <TableHead key={header.id}>
                                        {sortable ? (
                                            <Button
                                                variant="ghost"
                                                size="sm"
                                                className="-ml-2 h-8"
                                                aria-label={`Sort by ${columnId}`}
                                                onClick={() =>
                                                    // Clicking the active column flips direction;
                                                    // a new column starts ascending.
                                                    onSort(
                                                        columnId,
                                                        isActive && params.order === "asc" ? "desc" : "asc"
                                                    )
                                                }
                                            >
                                                {content}
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
                                        ) : (
                                            content
                                        )}
                                    </TableHead>
                                );
                            })}
                        </TableRow>
                    ))}
                </TableHeader>
                <TableBody>
                    {table.getRowModel().rows.map((row) => (
                        <TableRow key={row.id} data-state={row.original.status === "deleted" ? "archived" : undefined}>
                            {row.getVisibleCells().map((cell) => (
                                <TableCell
                                    key={cell.id}
                                    className={row.original.status === "deleted" ? "opacity-60" : undefined}
                                >
                                    {flexRender(cell.column.columnDef.cell, cell.getContext())}
                                </TableCell>
                            ))}
                        </TableRow>
                    ))}
                </TableBody>
            </Table>
        </div>
    );
}
