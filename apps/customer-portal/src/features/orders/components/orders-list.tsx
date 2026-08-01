"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { ShoppingCart } from "lucide-react";

import { Button } from "@/components/ui/button";
import { getOrders } from "../lib/orders-storage";
import type { Order } from "../types/order";
import { OrderCard } from "./order-card";

export function OrdersList() {
  const [orders, setOrders] = useState<Order[]>([]);

  useEffect(() => {
    setOrders(getOrders());
  }, []);

  if (orders.length === 0) {
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

  return (
    <div className="flex flex-col gap-4">
      {orders.map((order) => (
        <OrderCard key={order.orderNumber} order={order} />
      ))}
    </div>
  );
}
