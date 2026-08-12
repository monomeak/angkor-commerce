"use client";

import type { ColumnDef } from "@tanstack/react-table";
import Image from "next/image";
import Link from "next/link";
import { ImageOff } from "lucide-react";
import { formatMoney } from "@/lib/formatters";
import { resolveMediaUrl } from "@/lib/media";
import { ProductStatusBadge } from "./product-status-badge";
import { ProductStockCell } from "./product-stock-cell";
import { ProductRowActions } from "./product-row-actions";
import { categoryFromName, type CategoryLookup } from "../../categories/lib/category-lookup";
import type { ProductSummary } from "../types/product";

/**
 * Column ids double as the API's sortBy values, so the header only has to know whether an id
 * is sortable — see SORTABLE_FIELDS. Sorting is server-side; nothing here sorts locally.
 */
export function buildProductColumns(options: {
    mediaBaseUrl: string;
    categoryLookup: CategoryLookup;
    /**
     * Passed in rather than read from useTranslations(): this builds column definitions and
     * is not a component, so it cannot call hooks. The caller already has the translator.
     */
    t: (key: string, values?: Record<string, string | number>) => string;
    onArchive: (product: ProductSummary) => void;
    onFilterByCategory: (slug: string) => void;
}): ColumnDef<ProductSummary>[] {
    const { mediaBaseUrl, categoryLookup, t, onArchive, onFilterByCategory } = options;

    return [
        {
            id: "thumbnail",
            header: "",
            cell: ({ row }) => {
                const url = resolveMediaUrl(mediaBaseUrl, row.original.thumbnail);

                return (
                    <div className="bg-muted relative size-10 overflow-hidden rounded-md">
                        {url ? (
                            <Image
                                src={url}
                                alt=""
                                fill
                                sizes="40px"
                                className="object-cover"
                                // Product imagery is operator-uploaded and not worth failing
                                // a page render over; a broken key just shows the placeholder.
                                unoptimized
                            />
                        ) : (
                            <div className="text-muted-foreground flex size-full items-center justify-center">
                                <ImageOff className="size-4" />
                            </div>
                        )}
                    </div>
                );
            }
        },
        {
            id: "name",
            accessorKey: "name",
            header: t("colName"),
            cell: ({ row }) => (
                <Link
                    href={`/catalog/products/${row.original.id}/edit`}
                    className="font-medium underline-offset-4 hover:underline"
                >
                    {row.original.name}
                </Link>
            )
        },
        {
            id: "sku",
            header: t("colSku"),
            cell: ({ row }) => {
                // SKUs belong to variants, so a row has 0..n of them. The list endpoint does
                // not return them at all — showing the variant count is the honest summary.
                const { variantCount } = row.original;

                return (
                    <span className="text-muted-foreground text-sm">
                        {variantCount === 0 ? "—" : t("skuCount", { count: variantCount })}
                    </span>
                );
            }
        },
        {
            id: "category",
            accessorKey: "categoryName",
            header: t("category"),
            cell: ({ row }) => {
                const { categoryName } = row.original;
                if (!categoryName) return <span className="text-muted-foreground">—</span>;

                /*
                 * The row only carries a category *name* — ProductSummaryResponse drops the id
                 * — so filtering by it means resolving the name back to a category. When the
                 * name is ambiguous ("Shirt" sits under both Men and Women) the lookup returns
                 * nothing and the cell stays plain text: filtering to the wrong branch would
                 * look like a bug, while a non-clickable cell is merely unremarkable.
                 */
                const category = categoryFromName(categoryLookup, categoryName);
                if (!category) return categoryName;

                return (
                    <button
                        type="button"
                        onClick={() => onFilterByCategory(category.slug)}
                        className="underline-offset-4 hover:underline"
                        title={t("showOnly", { name: category.name })}
                    >
                        {categoryName}
                    </button>
                );
            }
        },
        {
            id: "price",
            accessorKey: "price",
            header: t("colPrice"),
            cell: ({ row }) => {
                const { price, currency, discountPercentage, variantCount } = row.original;

                return (
                    <div className="flex flex-col">
                        <span className="tabular-nums">
                            {/* The list returns the lowest effective variant price. */}
                            {variantCount > 1 ? `from ${formatMoney(price, currency)}` : formatMoney(price, currency)}
                        </span>
                        {discountPercentage > 0 && (
                            <span className="text-muted-foreground text-xs">-{discountPercentage}%</span>
                        )}
                    </div>
                );
            }
        },
        {
            id: "stock",
            header: t("colStock"),
            cell: ({ row }) => (
                <ProductStockCell totalStock={row.original.totalStock} variantCount={row.original.variantCount} />
            )
        },
        {
            id: "status",
            accessorKey: "status",
            header: t("colStatus"),
            cell: ({ row }) => <ProductStatusBadge status={row.original.status} />
        },
        {
            id: "actions",
            header: "",
            cell: ({ row }) => <ProductRowActions product={row.original} onArchive={onArchive} />
        }
    ];
}
