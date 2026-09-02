"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { ApiError } from "@/lib/api-client";
import { PaginationControls } from "@/lib/pagination-control";
import { CustomerDetailsDialog } from "../components/customer-details-dialog";
import { CustomerFilters } from "../components/customer-filters";
import { CustomersTable } from "../components/customers-table";
import { useCustomerListParams } from "../hooks/use-customer-list-params";
import { useCustomers } from "../hooks/use-customers";
import { PAGE_SIZE_OPTIONS } from "../lib/constants";

/**
 * The customer directory. Search, status filter, sort and paging all live in the URL and are
 * applied by core-api — the same arrangement as the catalogue's product list.
 */
export function CustomersListView() {
    const t = useTranslations("Customers");
    const { params, page, setParams } = useCustomerListParams();
    const { data, isLoading, isError, error, isFetching, refetch } = useCustomers(params);
    const [selectedCustomerId, setSelectedCustomerId] = useState<number | null>(null);

    const total = data?.total ?? 0;
    const pageCount = Math.max(1, Math.ceil(total / params.limit));

    if (isError) {
        // A staff session that expired mid-session reads as "forbidden", not as a broken list.
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

            <CustomerFilters params={params} onChange={setParams} />

            <Card>
                <CardContent className="p-0">
                    <CustomersTable
                        customers={data?.customers ?? []}
                        params={params}
                        isLoading={isLoading}
                        isFetching={isFetching}
                        onSort={(sortBy, order) => setParams({ sortBy, order })}
                        onViewDetails={setSelectedCustomerId}
                    />
                </CardContent>
            </Card>

            <PaginationControls
                currentPage={page}
                pageCount={pageCount}
                total={total}
                pageSize={params.limit}
                pageSizeOptions={PAGE_SIZE_OPTIONS}
                itemLabel="customer"
                onPageChange={(next) => setParams({ page: next })}
                onPageSizeChange={(limit) => setParams({ limit })}
            />

            <CustomerDetailsDialog customerId={selectedCustomerId} onClose={() => setSelectedCustomerId(null)} />
        </div>
    );
}
