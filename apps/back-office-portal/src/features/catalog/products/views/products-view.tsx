"use client";

import { Plus } from "lucide-react";
import Link from "next/link";
import { useMemo, useState } from "react";
import { useTranslations } from "next-intl";
import { Button } from "@/components/ui/button";
import { useAppConfig } from "@/components/providers/app-config-provider";
import { ArchiveProductDialog } from "../components/archive-product-dialog";
import { buildProductColumns } from "../components/product-columns";
import { ProductFilters } from "../components/product-filters";
import { ProductEmptyState, ProductErrorState } from "../components/product-list-states";
import { ProductPagination } from "../components/product-pagination";
import { ProductTable } from "../components/product-table";
import { ProductTableSkeleton } from "../components/product-table-skeleton";
import { useProductListParams } from "../hooks/use-product-list-params";
import { useProducts } from "../hooks/use-products";
import { useCategories } from "../../categories/hooks/use-categories";
import { buildCategoryLookup } from "../../categories/lib/category-lookup";
import type { ProductSummary } from "../types/product";

export function ProductsView() {
    const t = useTranslations("Catalog");
    const { mediaBaseUrl } = useAppConfig();
    const { params, page, setParams } = useProductListParams();
    const { data, isPending, isError, error, isFetching, refetch } = useProducts(params);

    const [productToArchive, setProductToArchive] = useState<ProductSummary | null>(null);

    const { data: categories } = useCategories();
    const categoryLookup = useMemo(() => buildCategoryLookup(categories ?? []), [categories]);

    const columns = useMemo(
        () =>
            buildProductColumns({
                mediaBaseUrl,
                categoryLookup,
                t,
                onArchive: setProductToArchive,
                onFilterByCategory: (categorySlug) => setParams({ categorySlug })
            }),
        [mediaBaseUrl, categoryLookup, t, setParams]
    );

    const hasFilters = Boolean(params.q || params.categorySlug || params.status);
    const clearFilters = () => setParams({ q: null, categorySlug: null, status: null });

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-semibold tracking-tight">{t("productsTitle")}</h1>
                    <p className="text-muted-foreground text-sm">{t("productsSubtitle")}</p>
                </div>
                <Button
                    render={
                        <Link href="/catalog/products/new">
                            <Plus className="size-4" />
                            {t("addProduct")}
                        </Link>
                    }
                />
            </div>

            <ProductFilters params={params} onChange={setParams} />

            {/* isPending covers the first load only; refetches keep the previous page on
                screen (keepPreviousData) and are signalled by dimming instead. */}
            {isPending ? (
                <ProductTableSkeleton rows={Math.min(params.limit, 8)} />
            ) : isError ? (
                <ProductErrorState error={error} onRetry={() => void refetch()} />
            ) : data.products.length === 0 ? (
                <ProductEmptyState hasFilters={hasFilters} onClear={clearFilters} />
            ) : (
                <>
                    <ProductTable
                        data={data.products}
                        columns={columns}
                        params={params}
                        isFetching={isFetching}
                        onSort={(sortBy, order) => setParams({ sortBy, order })}
                    />
                    <ProductPagination
                        page={page}
                        limit={params.limit}
                        total={data.total}
                        onPageChange={(next) => setParams({ page: next })}
                        onLimitChange={(limit) => setParams({ limit })}
                    />
                </>
            )}

            <ArchiveProductDialog
                product={productToArchive}
                onOpenChange={(open) => {
                    if (!open) setProductToArchive(null);
                }}
            />
        </div>
    );
}
