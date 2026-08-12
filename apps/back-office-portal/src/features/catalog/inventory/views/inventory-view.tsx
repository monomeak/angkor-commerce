"use client";

import { AlertTriangle, Boxes, ImageOff } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useTranslations } from "next-intl";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Empty, EmptyDescription, EmptyHeader, EmptyMedia, EmptyTitle } from "@/components/ui/empty";
import { Skeleton } from "@/components/ui/skeleton";
import { useAppConfig } from "@/components/providers/app-config-provider";
import { cn } from "@/lib/utils";
import { formatMoney } from "@/lib/formatters";
import { resolveMediaUrl } from "@/lib/media";
import { useCategories } from "../../categories/hooks/use-categories";
import { ProductErrorState } from "../../products/components/product-list-states";
import { LOW_STOCK_THRESHOLD } from "../../products/lib/constants";
import { sortCategoriesAsTree } from "../../categories/lib/category-tree";
import { useInventoryByCategory, type CategoryInventory } from "../hooks/use-inventory";
import type { ProductSummary } from "../../products/types/product";

function StockLine({ product, mediaBaseUrl }: { readonly product: ProductSummary; readonly mediaBaseUrl: string }) {
    const t = useTranslations("Catalog");
    const url = resolveMediaUrl(mediaBaseUrl, product.thumbnail);
    const isOut = product.totalStock <= 0;
    const isLow = !isOut && product.totalStock <= LOW_STOCK_THRESHOLD;

    return (
        <li>
            <Link
                href={`/catalog/products/${product.id}/edit`}
                className="hover:bg-accent flex items-center gap-3 rounded-md p-2 transition-colors"
            >
                <div className="bg-muted relative size-9 shrink-0 overflow-hidden rounded">
                    {url ? (
                        <Image src={url} alt="" fill sizes="36px" className="object-cover" unoptimized />
                    ) : (
                        <div className="text-muted-foreground flex size-full items-center justify-center">
                            <ImageOff className="size-4" />
                        </div>
                    )}
                </div>

                <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-medium">{product.name}</p>
                    <p className="text-muted-foreground text-xs">
                        {formatMoney(product.price, product.currency)}
                        {product.variantCount > 1 && ` · ${t("variantsCount", { count: product.variantCount })}`}
                    </p>
                </div>

                <span
                    className={cn("shrink-0 text-sm tabular-nums", (isLow || isOut) && "text-destructive font-medium")}
                >
                    {product.totalStock}
                </span>
            </Link>
        </li>
    );
}

function CategoryCard({ entry, mediaBaseUrl }: { readonly entry: CategoryInventory; readonly mediaBaseUrl: string }) {
    const t = useTranslations("Catalog");
    const { category, products, total, totalStock, lowStockCount, isLoading, isError } = entry;

    return (
        <Card className="flex flex-col">
            <CardHeader className="gap-1">
                <div className="flex items-start justify-between gap-2">
                    <CardTitle className="text-base">{category.name}</CardTitle>
                    {lowStockCount > 0 && (
                        <Badge variant="destructive" className="gap-1 shrink-0">
                            <AlertTriangle className="size-3" />
                            {t("lowCount", { count: lowStockCount })}
                        </Badge>
                    )}
                </div>
                <p className="text-muted-foreground text-sm">
                    {isLoading ? t("loading") : t("categorySummary", { total, stock: totalStock })}
                </p>
            </CardHeader>

            <CardContent className="flex-1">
                {isLoading ? (
                    <div className="space-y-2">
                        {Array.from({ length: 3 }).map((_, index) => (
                            <Skeleton key={index} className="h-12 w-full" />
                        ))}
                    </div>
                ) : isError ? (
                    <p className="text-muted-foreground text-sm">{t("categoryLoadFailed")}</p>
                ) : products.length === 0 ? (
                    <p className="text-muted-foreground rounded-md border border-dashed p-4 text-center text-sm">
                        {t("noProductsInCategory")}
                    </p>
                ) : (
                    <>
                        <ul className="-mx-2 space-y-1">
                            {products.map((product) => (
                                <StockLine key={product.id} product={product} mediaBaseUrl={mediaBaseUrl} />
                            ))}
                        </ul>
                        {/* The card fetches one page; say so rather than implying it is the whole set. */}
                        {total > products.length && (
                            <Link
                                // The list filters on slug, not id — see search-params.ts.
                                href={`/catalog/products?category=${encodeURIComponent(category.slug)}`}
                                className="text-muted-foreground mt-2 inline-block text-xs underline-offset-4 hover:underline"
                            >
                                {t("viewAll", { total })}
                            </Link>
                        )}
                    </>
                )}
            </CardContent>
        </Card>
    );
}

/**
 * A stock overview grouped by category, rather than another flat product table — the point
 * is spotting which parts of the catalogue are running dry.
 */
export function InventoryView() {
    const t = useTranslations("Catalog");
    const { mediaBaseUrl } = useAppConfig();
    const { data: categories, isPending, isError, error, refetch } = useCategories();

    // Tree order so children follow their parent, matching the categories screen.
    const ordered = categories ? sortCategoriesAsTree(categories).map((row) => row.category) : [];
    const inventory = useInventoryByCategory(ordered, LOW_STOCK_THRESHOLD);

    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-2xl font-semibold tracking-tight">{t("inventoryTitle")}</h1>
                <p className="text-muted-foreground text-sm">
                    {t("inventorySubtitle", { threshold: LOW_STOCK_THRESHOLD })}
                </p>
            </div>

            {isPending ? (
                <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
                    {Array.from({ length: 6 }).map((_, index) => (
                        <Skeleton key={index} className="h-64 w-full rounded-md" />
                    ))}
                </div>
            ) : isError ? (
                <ProductErrorState error={error} onRetry={() => void refetch()} />
            ) : ordered.length === 0 ? (
                <Empty className="border">
                    <EmptyHeader>
                        <EmptyMedia variant="icon">
                            <Boxes />
                        </EmptyMedia>
                        <EmptyTitle>{t("noCategoriesTitle")}</EmptyTitle>
                        <EmptyDescription>{t("inventoryNoCategoriesBody")}</EmptyDescription>
                    </EmptyHeader>
                </Empty>
            ) : (
                <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
                    {inventory.map((entry) => (
                        <CategoryCard key={entry.category.id} entry={entry} mediaBaseUrl={mediaBaseUrl} />
                    ))}
                </div>
            )}
        </div>
    );
}
