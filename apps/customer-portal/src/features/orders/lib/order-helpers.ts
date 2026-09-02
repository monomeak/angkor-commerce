import type { OrderStatus } from "../types/order";

/**
 * core-api's order lifecycle is PENDING → INVOICED, or PENDING → CANCELLED. "Invoiced" is
 * the paid state: the invoice only exists because a payment was confirmed.
 */
export const ORDER_STATUS_LABEL: Record<OrderStatus, string> = {
    pending: "Awaiting payment",
    invoiced: "Paid",
    cancelled: "Cancelled"
};

export function ordersHref(page: number): string {
    return page <= 1 ? "/account/orders" : `/account/orders?page=${page}`;
}
