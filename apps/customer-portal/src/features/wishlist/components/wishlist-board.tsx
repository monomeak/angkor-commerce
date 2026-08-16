"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Heart } from "lucide-react";

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
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { ApiError } from "@/lib/api-client";
import { ProductPagination } from "@/src/features/products/components/product-pagination";
import { WISHLIST_PAGE_SIZE } from "../api/wishlist-api";
import { useWishlistQuery } from "../hooks/use-wishlist";
import { useClearWishlist, useRemoveFromWishlist } from "../hooks/use-wishlist-mutations";
import { favoritesHref } from "../lib/wishlist-helpers";
import { WishlistCard } from "./wishlist-card";

type WishlistBoardProps = {
    /** From `?page=`, already floored at 1 by the route. Clamped here once the total is known. */
    readonly page: number;
};

/**
 * The customer's saved products. Paging goes through the URL and the same `ProductPagination`
 * the category grid uses; the rows are fetched client-side because the session cookie is
 * httpOnly on the API origin, where a server component cannot read it.
 */
export function WishlistBoard({ page }: WishlistBoardProps) {
    const router = useRouter();
    const { data, isPending, isError, isFetching, isPlaceholderData, refetch } = useWishlistQuery(page);
    const removeItem = useRemoveFromWishlist();
    const clearWishlist = useClearWishlist();
    const [isConfirmingClear, setIsConfirmingClear] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const total = data?.total ?? 0;
    const totalPages = Math.max(1, Math.ceil(total / WISHLIST_PAGE_SIZE));

    // Removing the last item on the last page leaves the URL past the end, which the API
    // answers with an empty page. Only the client knows the total, so it clamps here.
    const isPastEnd = Boolean(data) && !isPlaceholderData && page > totalPages;

    useEffect(() => {
        if (isPastEnd) {
            router.replace(favoritesHref(totalPages));
        }
    }, [isPastEnd, router, totalPages]);

    function reportError(fallback: string) {
        return (cause: unknown) => {
            setError(cause instanceof ApiError ? cause.displayMessage : fallback);
        };
    }

    function handleRemove(productId: number) {
        setError(null);
        removeItem.mutate(productId, { onError: reportError("Could not remove that product.") });
    }

    function handleClear() {
        setError(null);
        // Page 2 and beyond stop existing along with the rows.
        router.replace(favoritesHref(1));
        clearWishlist.mutate(undefined, { onError: reportError("Could not clear your favorites.") });
    }

    if (isPending) {
        return (
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {Array.from({ length: 3 }).map((_, index) => (
                    <Skeleton key={index} className="aspect-[3/4] w-full" />
                ))}
            </div>
        );
    }

    if (isError) {
        return (
            <div className="flex flex-col items-start gap-3">
                <p className="text-sm text-destructive">We couldn&apos;t load your favorites.</p>
                <Button variant="outline" disabled={isFetching} onClick={() => void refetch()}>
                    {isFetching ? "Retrying…" : "Try again"}
                </Button>
            </div>
        );
    }

    // An out-of-range page is a redirect in flight, not an empty wishlist.
    if (data.items.length === 0 && !isPastEnd) {
        return (
            <div className="flex flex-col items-center gap-3 py-10 text-center">
                <Heart className="size-10 text-muted-foreground" />
                <p className="text-account-text">You haven&apos;t added any favorites yet.</p>
                <Button nativeButton={false} render={<Link href="/" />} className="mt-2">
                    Browse products
                </Button>
            </div>
        );
    }

    const currentPage = Math.min(page, totalPages);

    return (
        <div className="flex flex-col gap-4">
            <div className="flex items-center justify-between gap-3">
                <p className="text-sm text-account-text">
                    {total} {total === 1 ? "product" : "products"} saved
                    {totalPages > 1 && ` · page ${currentPage} of ${totalPages}`}
                </p>
                <Button
                    variant="ghost"
                    size="sm"
                    disabled={clearWishlist.isPending}
                    onClick={() => setIsConfirmingClear(true)}
                >
                    {clearWishlist.isPending ? "Clearing…" : "Clear all"}
                </Button>
            </div>

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {data.items.map((item) => (
                    <WishlistCard
                        key={item.id}
                        item={item}
                        // Only the row being removed dims, rather than the whole grid.
                        isBusy={removeItem.isPending && removeItem.variables === item.productId}
                        onRemove={() => handleRemove(item.productId)}
                    />
                ))}
            </div>

            {error && <p className="text-sm text-destructive">{error}</p>}

            {totalPages > 1 && (
                <ProductPagination currentPage={currentPage} totalPages={totalPages} buildHref={favoritesHref} />
            )}

            <AlertDialog open={isConfirmingClear} onOpenChange={setIsConfirmingClear}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Clear your favorites?</AlertDialogTitle>
                        <AlertDialogDescription>
                            All {total} saved {total === 1 ? "product" : "products"} are removed. Nothing else changes —
                            your cart and your orders are untouched.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction
                            variant="destructive"
                            onClick={() => {
                                setIsConfirmingClear(false);
                                handleClear();
                            }}
                        >
                            Clear all
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </div>
    );
}
