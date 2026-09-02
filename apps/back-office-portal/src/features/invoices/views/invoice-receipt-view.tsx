"use client";

import Link from "next/link";
import { useTranslations } from "next-intl";
import { ChevronLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { ApiError } from "@/lib/api-client";
import { InvoiceReceipt } from "../components/invoice-receipt";
import { useInvoice } from "../hooks/use-invoice";

export function InvoiceReceiptView({ invoiceId }: { readonly invoiceId: number }) {
    const t = useTranslations("Invoices");
    const { data: invoice, isLoading, isError, error } = useInvoice(invoiceId);

    if (isLoading) {
        return <Skeleton className="h-[32rem] w-full rounded-lg" />;
    }

    if (isError || !invoice) {
        // A 404 here is a wrong id in the URL, not a broken screen.
        const isMissing = error instanceof ApiError && error.status === 404;

        return (
            <div className="flex flex-col items-start gap-3">
                <p className="text-sm text-destructive">{isMissing ? t("notFound") : t("error")}</p>
                <Button nativeButton={false} render={<Link href="/invoices" />} variant="outline">
                    {t("backToList")}
                </Button>
            </div>
        );
    }

    return (
        <div className="space-y-4">
            <Link
                href="/invoices"
                className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground print:hidden"
            >
                <ChevronLeft className="size-4" />
                {t("backToList")}
            </Link>

            <InvoiceReceipt invoice={invoice} />
        </div>
    );
}
