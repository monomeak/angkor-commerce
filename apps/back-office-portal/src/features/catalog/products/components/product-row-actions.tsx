"use client";

import { Archive, MoreHorizontal, Pencil, RotateCcw } from "lucide-react";
import Link from "next/link";
import { toast } from "sonner";
import { useTranslations } from "next-intl";
import { Button } from "@/components/ui/button";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger
} from "@/components/ui/dropdown-menu";
import { ApiError } from "@/lib/api-client";
import { useRestoreProduct } from "../hooks/use-product-mutations";
import type { ProductSummary } from "../types/product";

type ProductRowActionsProps = {
    readonly product: ProductSummary;
    readonly onArchive: (product: ProductSummary) => void;
};

export function ProductRowActions({ product, onArchive }: ProductRowActionsProps) {
    const t = useTranslations("Catalog");
    const restore = useRestoreProduct();
    const isArchived = product.status === "deleted";

    const handleRestore = async () => {
        try {
            await restore.mutateAsync(product.id);
            toast.success(t("productRestored", { name: product.name }));
        } catch (error) {
            toast.error(error instanceof ApiError ? error.displayMessage : t("restoreFailed"));
        }
    };

    return (
        <DropdownMenu>
            <DropdownMenuTrigger
                render={
                    <Button variant="ghost" size="icon" aria-label={`Actions for ${product.name}`}>
                        <MoreHorizontal className="size-4" />
                    </Button>
                }
            />
            <DropdownMenuContent align="end">
                <DropdownMenuItem
                    render={
                        <Link href={`/catalog/products/${product.id}/edit`}>
                            <Pencil className="size-4" />
                            {t("edit")}
                        </Link>
                    }
                />

                {isArchived ? (
                    <DropdownMenuItem onClick={() => void handleRestore()} disabled={restore.isPending}>
                        <RotateCcw className="size-4" />
                        {restore.isPending ? t("restoring") : t("restore")}
                    </DropdownMenuItem>
                ) : (
                    <DropdownMenuItem variant="destructive" onClick={() => onArchive(product)}>
                        <Archive className="size-4" />
                        {t("archive")}
                    </DropdownMenuItem>
                )}
            </DropdownMenuContent>
        </DropdownMenu>
    );
}
