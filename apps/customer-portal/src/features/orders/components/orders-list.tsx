"use client";

import Link from "next/link";
import { ShoppingCart } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { ProductPagination } from "@/src/features/products/components/product-pagination";
import { ORDERS_PAGE_SIZE } from "../api/order-api";
import { useOrdersQuery } from "../hooks/use-orders";
import { ordersHref } from "../lib/order-helpers";
import { OrderCard } from "./order-card";

/**
 * The customer's order history, straight from `/storefront/orders`. Client-side like the
 * favorites grid, and for the same reason: the session cookie is httpOnly on the API origin.
 */
export function OrdersList({ page }: { readonly page: number }) {
    const { data, isPending, isError, isFetching, refetch } = useOrdersQuery(page);

    if (isPending) {
        return (
            <div className="flex flex-col gap-3">
                {Array.from({ length: 3 }).map((_, index) => (
                    <Skeleton key={index} className="h-24 w-full rounded-2xl" />
                ))}
            </div>
        );
    }

    if (isError) {
        return (
            <div className="flex flex-col items-start gap-3">
                <p className="text-sm text-destructive">We couldn&apos;t load your orders.</p>
                <Button variant="outline" disabled={isFetching} onClick={() => void refetch()}>
                    {isFetching ? "Retrying…" : "Try again"}
                </Button>
            </div>
        );
    }

    if (data.items.length === 0) {
        return (
            <div className="flex flex-col items-center gap-3 py-10 text-center">
                <ShoppingCart className="size-10 text-muted-foreground" />
                <p className="text-account-text">You haven&apos;t placed any orders yet.</p>
                <Button nativeButton={false} render={<Link href="/" />} className="mt-2">
                    Continue shopping
                </Button>
            </div>
        );
    }

    const totalPages = Math.max(1, Math.ceil(data.total / ORDERS_PAGE_SIZE));

    return (
        <div className="flex flex-col gap-4">
            {data.items.map((order) => (
                <OrderCard key={order.id} order={order} />
            ))}

            {totalPages > 1 && (
                <ProductPagination
                    currentPage={Math.min(page, totalPages)}
                    totalPages={totalPages}
                    buildHref={ordersHref}
                />
            )}
        </div>
    );
}
