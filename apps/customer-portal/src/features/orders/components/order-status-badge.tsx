import { Badge } from "@/components/ui/badge";
import { ORDER_STATUS_LABEL } from "../lib/order-helpers";
import type { OrderStatus } from "../types/order";

const VARIANT: Record<OrderStatus, "default" | "secondary" | "destructive"> = {
    pending: "secondary",
    invoiced: "default",
    cancelled: "destructive"
};

export function OrderStatusBadge({ status }: { readonly status: OrderStatus }) {
    return <Badge variant={VARIANT[status]}>{ORDER_STATUS_LABEL[status]}</Badge>;
}
