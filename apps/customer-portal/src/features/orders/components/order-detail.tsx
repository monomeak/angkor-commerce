"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";

import { useAppConfig } from "@/components/providers/app-config-provider";
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
import { formatDateTime } from "@/lib/date";
import { PayPendingOrderButton } from "@/src/features/checkout/components/pay-pending-order-button";
import { OrderReceipt } from "@/src/features/invoices/components/order-receipt";
import { useOrderInvoiceQuery } from "@/src/features/invoices/hooks/use-order-invoice";
import { productImageSrc } from "@/src/features/products/lib/product-image";
import { formatPrice } from "@/src/features/products/lib/pricing";
import { useCancelOrder, useOrderQuery } from "../hooks/use-orders";
import type { Order } from "../types/order";
import { OrderStatusBadge } from "./order-status-badge";

/**
 * One order in full, plus its receipt once it has one. The two are separate documents in
 * core-api — the order is the request, the invoice is what was actually charged — so both are
 * shown rather than the order's numbers being passed off as a receipt.
 */
export function OrderDetail({ orderId }: { readonly orderId: number }) {
    const { data: order, isPending, isError } = useOrderQuery(orderId);
    const { data: invoice } = useOrderInvoiceQuery(orderId, order?.status === "invoiced");

    if (isPending) {
        return <Skeleton className="h-96 w-full rounded-2xl" />;
    }

    if (isError || !order) {
        return (
            <div className="flex flex-col items-center gap-3 rounded-2xl border bg-card p-10 text-center">
                <p className="text-muted-foreground">We couldn&apos;t find that order.</p>
                <Button nativeButton={false} render={<Link href="/account/orders" />}>
                    Back to my orders
                </Button>
            </div>
        );
    }

    return (
        <div className="flex flex-col gap-4">
            <OrderCardDetail order={order} />

            {order.status === "pending" && (
                <div className="rounded-2xl border bg-card p-6">
                    <h2 className="font-semibold">Finish paying</h2>
                    <p className="mt-1 mb-3 text-sm text-muted-foreground">
                        This order is placed and its stock is reserved, but nothing has been charged yet.
                    </p>
                    <PayPendingOrderButton orderId={order.id} amountDue={order.total} currency={order.currency} />
                </div>
            )}

            {invoice && <OrderReceipt invoice={invoice} />}
        </div>
    );
}

function OrderCardDetail({ order }: { readonly order: Order }) {
    const { mediaBaseUrl, locale, timezone } = useAppConfig();
    const cancelOrder = useCancelOrder();
    const [isConfirmingCancel, setIsConfirmingCancel] = useState(false);
    const [error, setError] = useState<string | null>(null);

    function handleCancel() {
        setError(null);
        cancelOrder.mutate(order.id, {
            onError: (cause) => {
                setError(cause instanceof ApiError ? cause.displayMessage : "Could not cancel that order.");
            }
        });
    }

    return (
        <div className="rounded-2xl border bg-card p-6">
            <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                    <p className="text-lg font-semibold">{order.orderNumber}</p>
                    <p className="text-sm text-muted-foreground">
                        Placed {formatDateTime(order.placedAt, locale, timezone)}
                    </p>
                </div>
                <OrderStatusBadge status={order.status} />
            </div>

            <ul className="mt-4 flex flex-col gap-3 border-t pt-4">
                {order.items.map((item) => (
                    <li key={item.id} className="flex items-center gap-3">
                        <div className="relative flex size-14 shrink-0 items-center justify-center overflow-hidden rounded-lg bg-gradient-to-br from-muted to-muted/40">
                            <Image
                                src={productImageSrc(mediaBaseUrl, item.thumbnail, item.title)}
                                alt={item.title}
                                width={48}
                                height={48}
                                unoptimized
                            />
                        </div>
                        <div className="flex flex-1 flex-wrap items-center justify-between gap-2">
                            <div>
                                <p className="text-sm font-medium">{item.title}</p>
                                <p className="text-xs text-muted-foreground">
                                    {item.sku} · {formatPrice(item.unitPrice, order.currency, locale)} × {item.quantity}
                                </p>
                            </div>
                            <span className="text-sm font-medium">
                                {formatPrice(item.lineTotal, order.currency, locale)}
                            </span>
                        </div>
                    </li>
                ))}
            </ul>

            <div className="mt-4 flex flex-col gap-1 border-t pt-4 text-sm">
                <div className="flex items-center justify-between text-muted-foreground">
                    <span>Subtotal</span>
                    <span>{formatPrice(order.subtotal, order.currency, locale)}</span>
                </div>
                <div className="flex items-center justify-between text-muted-foreground">
                    <span>Delivery</span>
                    <span>{formatPrice(order.shippingFee, order.currency, locale)}</span>
                </div>
                <div className="flex items-center justify-between font-semibold text-foreground">
                    <span>Total</span>
                    <span>{formatPrice(order.total, order.currency, locale)}</span>
                </div>
            </div>

            <div className="mt-4 border-t pt-4 text-sm text-muted-foreground">
                <p className="font-medium text-foreground">Delivering to</p>
                <p>{order.shipping.fullName}</p>
                <p>{order.shipping.phone}</p>
                <p>
                    {order.shipping.address}, {order.shipping.city}
                    {order.shipping.postalCode ? ` ${order.shipping.postalCode}` : ""}
                </p>
                {order.shipping.notes && <p>Notes: {order.shipping.notes}</p>}
            </div>

            {error && <p className="mt-3 text-sm text-destructive">{error}</p>}

            {/* Only a pending order can be cancelled — the API releases its stock as it does. */}
            {order.status === "pending" && (
                <Button
                    variant="ghost"
                    size="sm"
                    className="mt-3"
                    disabled={cancelOrder.isPending}
                    onClick={() => setIsConfirmingCancel(true)}
                >
                    {cancelOrder.isPending ? "Cancelling…" : "Cancel order"}
                </Button>
            )}

            <AlertDialog open={isConfirmingCancel} onOpenChange={setIsConfirmingCancel}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Cancel {order.orderNumber}?</AlertDialogTitle>
                        <AlertDialogDescription>
                            The reserved items go back on sale and the order cannot be paid afterwards. Nothing has
                            been charged, so there is nothing to refund.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel>Keep it</AlertDialogCancel>
                        <AlertDialogAction
                            variant="destructive"
                            onClick={() => {
                                setIsConfirmingCancel(false);
                                handleCancel();
                            }}
                        >
                            Cancel order
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </div>
    );
}
