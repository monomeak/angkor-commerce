"use client";

import { useTranslations } from "next-intl";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { ApiError } from "@/lib/api-client";
import { PaginationControls } from "@/lib/pagination-control";
import { InvoiceFilters } from "../components/invoice-filters";
import { InvoicesTable } from "../components/invoices-table";
import { useInvoiceListParams } from "../hooks/use-invoice-list-params";
import { useInvoices } from "../hooks/use-invoices";
import { PAGE_SIZE_OPTIONS } from "../lib/constants";

/**
 * The invoice register. Search, status, both date ranges, sort and paging live in the URL and
 * are applied by core-api — the same arrangement as the catalogue and the customer directory.
 */
export function InvoicesListView() {
    const t = useTranslations("Invoices");
    const { params, page, setParams } = useInvoiceListParams();
    const { data, isLoading, isError, error, isFetching, refetch } = useInvoices(params);

    const statusLabels: Record<string, string> = {
        ISSUED: t("status_ISSUED"),
        PARTIALLY_PAID: t("status_PARTIALLY_PAID"),
        PAID: t("status_PAID"),
        CANCELLED: t("status_CANCELLED"),
        OVERDUE: t("status_OVERDUE")
    };

    const total = data?.total ?? 0;
    const pageCount = Math.max(1, Math.ceil(total / params.limit));

    if (isError) {
        const isForbidden = error instanceof ApiError && (error.status === 401 || error.status === 403);

        return (
            <div className="space-y-3">
                <p className="text-sm text-destructive">{isForbidden ? t("forbidden") : t("error")}</p>
                <Button variant="outline" disabled={isFetching} onClick={() => void refetch()}>
                    {isFetching ? t("loading") : t("retry")}
                </Button>
            </div>
        );
    }

    return (
        <div className="space-y-4">
            <div>
                <h1 className="text-2xl font-semibold tracking-tight">{t("title")}</h1>
                <p className="text-sm text-muted-foreground">{t("subtitle")}</p>
            </div>

            <InvoiceFilters params={params} onChange={setParams} />

            <Card>
                <CardContent className="p-0">
                    <InvoicesTable
                        invoices={data?.invoices ?? []}
                        params={params}
                        isLoading={isLoading}
                        isFetching={isFetching}
                        statusLabels={statusLabels}
                        onSort={(sortBy, order) => setParams({ sortBy, order })}
                        onFilterByCustomer={(customerId) => setParams({ customerId })}
                    />
                </CardContent>
            </Card>

            <PaginationControls
                currentPage={page}
                pageCount={pageCount}
                total={total}
                pageSize={params.limit}
                pageSizeOptions={PAGE_SIZE_OPTIONS}
                itemLabel="invoice"
                onPageChange={(next) => setParams({ page: next })}
                onPageSizeChange={(limit) => setParams({ limit })}
            />
        </div>
    );
}
