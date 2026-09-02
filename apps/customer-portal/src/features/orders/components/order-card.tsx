"use client";

import Link from "next/link";

import { useAppConfig } from "@/components/providers/app-config-provider";
import { formatDate } from "@/lib/date";
import { formatPrice } from "@/src/features/products/lib/pricing";
import type { OrderSummary } from "../types/order";
import { OrderStatusBadge } from "./order-status-badge";

/** A history row. Items live on the detail record, so a row shows only what the API pre-counted. */
export function OrderCard({ order }: { readonly order: OrderSummary }) {
    const { locale, timezone } = useAppConfig();

    return (
        <Link
            href={`/account/orders/${order.id}`}
            className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border bg-card p-5 transition-colors hover:border-primary/50"
        >
            <div>
                <p className="font-semibold">{order.orderNumber}</p>
                <p className="text-sm text-muted-foreground">
                    {formatDate(order.placedAt, locale, timezone)} · {order.totalItems}{" "}
                    {order.totalItems === 1 ? "item" : "items"} ({order.totalQuantity} pcs)
                </p>
            </div>
            <div className="flex items-center gap-3">
                <OrderStatusBadge status={order.status} />
                <span className="font-semibold">{formatPrice(order.total, order.currency, locale)}</span>
            </div>
        </Link>
    );
}
