"use client";

import { Archive, ArrowLeft, RotateCcw } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useTranslations } from "next-intl";
import { useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { ApiError } from "@/lib/api-client";
import { formatDateTime } from "@/lib/formatters";
import { ArchiveProductDialog } from "../components/archive-product-dialog";
import { ProductForm, type ProductFormSubmit } from "../components/product-form";
import { ProductImages } from "../components/product-images";
import { ProductErrorState } from "../components/product-list-states";
import { ProductStatusBadge } from "../components/product-status-badge";
import { useProduct } from "../hooks/use-product";
import { useRestoreProduct, useUpdateProduct } from "../hooks/use-product-mutations";
import { applyServerErrors } from "../lib/apply-server-errors";
import { buildPatchBody } from "../lib/build-patch-body";
import { toProductFormValues, toVariantRows } from "../lib/form-values";

const LIST_HREF = "/catalog/products";

export function ProductEditView({ productId }: { readonly productId: number }) {
    const t = useTranslations("Catalog");
    const router = useRouter();
    const { data: product, isPending, isError, error, refetch } = useProduct(productId);
    const updateProduct = useUpdateProduct();
    const restoreProduct = useRestoreProduct();
    const [isArchiveOpen, setIsArchiveOpen] = useState(false);

    const handleSubmit: ProductFormSubmit = async (values, { dirtyFields, setError, reset }) => {
        if (!product) return;

        /*
         * Only touched fields travel. `variants` is excluded because PATCH /products/{id}
         * has no variants field at all — those changes go through the variant endpoints,
         * reconciled inside useUpdateProduct.
         */
        const body = buildPatchBody(values as unknown as Record<string, unknown>, dirtyFields, {
            omit: ["variants", "images"]
        });

        try {
            const updated = await updateProduct.mutateAsync({
                id: product.id,
                body,
                variantRows: toVariantRows(values),
                existingVariants: product.variants
            });

            // Re-seed from the server response so ids on newly created variant rows are
            // present, and isDirty goes back to false.
            reset(toProductFormValues(updated));
            toast.success(t("changesSaved"));
        } catch (cause) {
            const toastMessage = applyServerErrors(cause, setError);
            if (toastMessage) toast.error(toastMessage);
        }
    };

    const handleRestore = async () => {
        if (!product) return;

        try {
            await restoreProduct.mutateAsync(product.id);
            toast.success(t("productRestored", { name: product.name }));
        } catch (cause) {
            toast.error(cause instanceof ApiError ? cause.displayMessage : t("restoreFailed"));
        }
    };

    if (isPending) {
        return (
            <div className="space-y-6">
                <Skeleton className="h-9 w-64" />
                <Skeleton className="h-64 w-full rounded-md" />
                <Skeleton className="h-48 w-full rounded-md" />
            </div>
        );
    }

    if (isError) {
        // A 404 here usually means the product was archived by someone else: reads hide
        // archived records, so the edit page can no longer load it.
        return <ProductErrorState error={error} onRetry={() => void refetch()} />;
    }

    const isArchived = product.status === "deleted";

    return (
        <div className="space-y-6">
            <div className="flex flex-wrap items-center gap-3">
                <Button
                    variant="ghost"
                    size="icon"
                    aria-label={t("backToProducts")}
                    render={
                        <Link href={LIST_HREF}>
                            <ArrowLeft className="size-4" />
                        </Link>
                    }
                />
                <div className="flex-1">
                    <div className="flex items-center gap-2">
                        <h1 className="text-2xl font-semibold tracking-tight">{product.name}</h1>
                        <ProductStatusBadge status={product.status} />
                    </div>
                    <p className="text-muted-foreground text-sm">
                        {t("lastUpdatedSummary", {
                            when: formatDateTime(product.updatedAt),
                            stock: product.totalStock,
                            variants: product.variants.length
                        })}
                    </p>
                </div>
            </div>

            <ProductForm
                mode="edit"
                // Remounts when the record changes identity, so RHF re-reads defaultValues
                // instead of holding the previous product's values.
                key={product.id}
                defaultValues={toProductFormValues(product)}
                onSubmit={handleSubmit}
                isSubmitting={updateProduct.isPending}
                cancelHref={LIST_HREF}
                secondaryAction={
                    isArchived ? (
                        <Button
                            type="button"
                            variant="outline"
                            onClick={() => void handleRestore()}
                            disabled={restoreProduct.isPending}
                        >
                            <RotateCcw className="size-4" />
                            {restoreProduct.isPending ? t("restoring") : t("restoreProduct")}
                        </Button>
                    ) : (
                        <Button type="button" variant="destructive" onClick={() => setIsArchiveOpen(true)}>
                            <Archive className="size-4" />
                            {t("archive")}
                        </Button>
                    )
                }
            />

            {/* Sits outside the form: uploads and deletes hit the API immediately, so they
                are not part of the form's save/discard cycle. */}
            <ProductImages product={product} />

            <ArchiveProductDialog
                product={isArchiveOpen ? { id: product.id, name: product.name } : null}
                onOpenChange={setIsArchiveOpen}
                onArchived={() => router.push(LIST_HREF)}
            />
        </div>
    );
}
