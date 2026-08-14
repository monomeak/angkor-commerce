"use client";

import { ArrowLeft } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useTranslations } from "next-intl";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { useAppConfig } from "@/components/providers/app-config-provider";
import { ProductForm, type ProductFormSubmit } from "../components/product-form";
import { useCreateProduct } from "../hooks/use-product-mutations";
import { applyServerErrors } from "../lib/apply-server-errors";
import { emptyProductFormValues, toCreatePayload } from "../lib/form-values";

const LIST_HREF = "/catalog/products";

export function ProductCreateView() {
    const t = useTranslations("Catalog");
    const router = useRouter();
    const { currency } = useAppConfig();
    const createProduct = useCreateProduct();

    const handleSubmit: ProductFormSubmit = async (values, { setError, reset }) => {
        try {
            const created = await createProduct.mutateAsync(toCreatePayload(values));

            // Clear the dirty flag before navigating, or the unsaved-changes guard fires on
            // the redirect it was told to make.
            reset(values);
            toast.success(t("productCreated", { name: created.name }));
            router.push(`/catalog/products/${created.id}/edit`);
        } catch (error) {
            const toastMessage = applyServerErrors(error, setError);
            if (toastMessage) toast.error(toastMessage);
        }
    };

    return (
        <div className="space-y-6">
            <div className="flex items-center gap-3">
                <Button
                    variant="ghost"
                    size="icon"
                    aria-label={t("backToProducts")}
                    nativeButton={false}
                    render={
                        <Link href={LIST_HREF}>
                            <ArrowLeft className="size-4" />
                        </Link>
                    }
                />
                <div>
                    <h1 className="text-2xl font-semibold tracking-tight">{t("newProductTitle")}</h1>
                    <p className="text-muted-foreground text-sm">{t("newProductSubtitle")}</p>
                </div>
            </div>

            <ProductForm
                mode="create"
                defaultValues={emptyProductFormValues(currency)}
                onSubmit={handleSubmit}
                isSubmitting={createProduct.isPending}
                cancelHref={LIST_HREF}
            />
        </div>
    );
}
