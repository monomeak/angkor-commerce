"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { CheckCircle2 } from "lucide-react";

import { Button } from "@/components/ui/button";
import { OrderCard } from "@/src/features/orders/components/order-card";
import { getOrderByNumber } from "@/src/features/orders/lib/orders-storage";
import type { Order } from "@/src/features/orders/types/order";

export function OrderConfirmation({ orderNumber }: { readonly orderNumber: string }) {
  const [order, setOrder] = useState<Order | null | undefined>(undefined);

  useEffect(() => {
    setOrder(getOrderByNumber(orderNumber) ?? null);
  }, [orderNumber]);

  if (order === undefined) {
    return null;
  }

  if (order === null) {
    return (
      <div className="flex flex-col items-center gap-3 rounded-2xl border bg-card p-10 text-center">
        <p className="text-muted-foreground">We couldn&apos;t find that order.</p>
        <Button nativeButton={false} render={<Link href="/" />}>
          Continue shopping
        </Button>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center gap-6">
      <div className="flex flex-col items-center gap-2 text-center">
        <CheckCircle2 className="size-12 text-emerald-500" />
        <h1 className="text-2xl font-semibold tracking-[-0.03em] sm:text-3xl">Order placed!</h1>
        <p className="text-muted-foreground">
          Thanks — we&apos;ve received your order and will be in touch about delivery.
        </p>
      </div>

      <div className="w-full max-w-lg">
        <OrderCard order={order} />
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
