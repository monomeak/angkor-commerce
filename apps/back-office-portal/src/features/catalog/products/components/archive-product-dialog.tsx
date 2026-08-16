"use client";

import { toast } from "sonner";
import { useTranslations } from "next-intl";
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle
} from "@/components/ui/alert-dialog";
import { ApiError } from "@/lib/api-client";
import { useArchiveProduct } from "../hooks/use-product-mutations";

type ArchiveProductDialogProps = {
    readonly product: { id: number; name: string } | null;
    readonly onOpenChange: (open: boolean) => void;
    readonly onArchived?: () => void;
};

/**
 * Naming the product in the confirmation matters here: the row actions menu is small and
 * it is easy to open it on the wrong row.
 */
export function ArchiveProductDialog({ product, onOpenChange, onArchived }: ArchiveProductDialogProps) {
    const t = useTranslations("Catalog");
    const archive = useArchiveProduct();

    const handleConfirm = async () => {
        if (!product) return;

        try {
            await archive.mutateAsync(product.id);
            toast.success(t("archived_toast", { name: product.name }), {
                description: t("archivedHint")
            });
            onOpenChange(false);
            onArchived?.();
        } catch (error) {
            // 403 is the expected failure for staff: archiving is SHOP_ADMIN/SUPER_ADMIN only.
            const message =
                error instanceof ApiError && error.status === 403
                    ? t("noPermissionArchive")
                    : error instanceof ApiError
                      ? error.displayMessage
                      : t("archiveFailed");

            toast.error(message);
        }
    };

    return (
        <AlertDialog open={product !== null} onOpenChange={onOpenChange}>
            <AlertDialogContent>
                <AlertDialogHeader>
                    <AlertDialogTitle>{t("archiveTitle", { name: product?.name ?? "" })}</AlertDialogTitle>
                    <AlertDialogDescription>{t("archiveBody")}</AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                    <AlertDialogCancel disabled={archive.isPending}>{t("cancel")}</AlertDialogCancel>
                    <AlertDialogAction
                        onClick={(event) => {
                            // Keep the dialog open while the request is in flight, so the
                            // pending state is visible and a failure can be reported in place.
                            event.preventDefault();
                            void handleConfirm();
                        }}
                        disabled={archive.isPending}
                    >
                        {archive.isPending ? t("archiving") : t("archive")}
                    </AlertDialogAction>
                </AlertDialogFooter>
            </AlertDialogContent>
        </AlertDialog>
    );
}
