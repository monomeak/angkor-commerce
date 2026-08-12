"use client";

import { useTranslations } from "next-intl";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { LOW_STOCK_THRESHOLD } from "../lib/constants";

/**
 * Stock is summed across variants by the API. The variant count is worth showing alongside
 * it because "42 in stock" means something different for one variant than for six.
 */
export function ProductStockCell({
    totalStock,
    variantCount
}: {
    readonly totalStock: number;
    readonly variantCount: number;
}) {
    const t = useTranslations("Catalog");
    const isOutOfStock = totalStock <= 0;
    const isLow = !isOutOfStock && totalStock <= LOW_STOCK_THRESHOLD;

    return (
        <div className="flex items-center gap-2">
            <span className={cn("tabular-nums", (isLow || isOutOfStock) && "text-destructive font-medium")}>
                {totalStock}
            </span>

            {isOutOfStock && <Badge variant="destructive">{t("outOfStock")}</Badge>}
            {isLow && <Badge variant="destructive">{t("low")}</Badge>}

            {variantCount > 1 && (
                <span className="text-muted-foreground text-xs">{t("variantsCount", { count: variantCount })}</span>
            )}
        </div>
    );
}
