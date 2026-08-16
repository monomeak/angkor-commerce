"use client";

import { AlertCircle, PackageOpen, PackageSearch, ShieldOff } from "lucide-react";
import Link from "next/link";
import { useTranslations } from "next-intl";
import { Button } from "@/components/ui/button";
import { Empty, EmptyContent, EmptyDescription, EmptyHeader, EmptyMedia, EmptyTitle } from "@/components/ui/empty";
import { ApiError } from "@/lib/api-client";

/** Nothing matches the current filters — recoverable, so offer the way out. */
export function ProductEmptyState({
    hasFilters,
    onClear
}: {
    readonly hasFilters: boolean;
    readonly onClear: () => void;
}) {
    const t = useTranslations("Catalog");
    if (hasFilters) {
        return (
            <Empty className="border">
                <EmptyHeader>
                    <EmptyMedia variant="icon">
                        <PackageSearch />
                    </EmptyMedia>
                    <EmptyTitle>{t("emptyFilteredTitle")}</EmptyTitle>
                    <EmptyDescription>{t("emptyFilteredBody")}</EmptyDescription>
                </EmptyHeader>
                <EmptyContent>
                    <Button variant="outline" onClick={onClear}>
                        {t("clearFilters")}
                    </Button>
                </EmptyContent>
            </Empty>
        );
    }

    return (
        <Empty className="border">
            <EmptyHeader>
                <EmptyMedia variant="icon">
                    <PackageOpen />
                </EmptyMedia>
                <EmptyTitle>{t("emptyTitle")}</EmptyTitle>
                <EmptyDescription>{t("emptyBody")}</EmptyDescription>
            </EmptyHeader>
            <EmptyContent>
                <Button nativeButton={false} render={<Link href="/catalog/products/new">{t("addProduct")}</Link>} />
            </EmptyContent>
        </Empty>
    );
}

/**
 * 403 is a state, not a crash: a staff user can read the catalogue but not change it, and
 * the API says so per request. It gets its own copy rather than a generic failure message.
 */
export function ProductErrorState({ error, onRetry }: { readonly error: unknown; readonly onRetry: () => void }) {
    const t = useTranslations("Catalog");
    const isForbidden = error instanceof ApiError && error.status === 403;
    // A server-sent message is already meaningful and specific; only the generic
    // fallback is worth translating.
    const message = error instanceof ApiError ? error.displayMessage : t("errorBody");

    return (
        <Empty className="border">
            <EmptyHeader>
                <EmptyMedia variant="icon">{isForbidden ? <ShieldOff /> : <AlertCircle />}</EmptyMedia>
                <EmptyTitle>{isForbidden ? t("forbiddenTitle") : t("errorTitle")}</EmptyTitle>
                <EmptyDescription>{isForbidden ? t("forbiddenBody") : message}</EmptyDescription>
            </EmptyHeader>
            {!isForbidden && (
                <EmptyContent>
                    <Button variant="outline" onClick={onRetry}>
                        {t("retry")}
                    </Button>
                </EmptyContent>
            )}
        </Empty>
    );
}
