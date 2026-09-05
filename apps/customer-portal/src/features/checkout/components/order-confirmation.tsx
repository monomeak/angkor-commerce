"use client";

import Link from "next/link";
import { CheckCircle2 } from "lucide-react";

import { Button } from "@/components/ui/button";
import { OrderDetail } from "@/src/features/orders/components/order-detail";

/**
 * The order as core-api stored it, not a copy of what was submitted — including the receipt,
 * which `OrderDetail` renders once the order is invoiced. Reloading the page or coming back
 * to the URL later shows the same thing.
 */
export function OrderConfirmation({ orderId }: { readonly orderId: number }) {
    return (
        <div className="flex flex-col items-center gap-6">
            <div className="flex flex-col items-center gap-2 text-center">
                <CheckCircle2 className="size-12 text-emerald-500" />
                <h1 className="text-2xl font-semibold tracking-[-0.03em] sm:text-3xl">Order placed!</h1>
                <p className="text-muted-foreground">
                    Thanks — we&apos;ve received your order and will be in touch about delivery.
                </p>
            </div>

            <div className="w-full max-w-2xl">
                <OrderDetail orderId={orderId} />
            </div>

            <div className="flex gap-3">
                <Button nativeButton={false} render={<Link href="/" />} variant="outline">
                    Continue shopping
                </Button>
                <Button nativeButton={false} render={<Link href="/account/orders" />}>
                    View my orders
                </Button>
            </div>
        </div>
    );
}
