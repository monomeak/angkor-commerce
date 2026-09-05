import { apiFetch, parseResponse } from "@/lib/api-client";
import { mapOrder, mapOrderPage } from "../mappers/order.mapper";
import { orderDtoSchema, orderPageDtoSchema } from "../schemas/order-api.schema";
import type { CreateOrderPayload, Order, OrderPage } from "../types/order";

/*
 * Customer-scoped throughout: core-api reads the customer off the session and answers 404 —
 * never 403 — for someone else's order, so the hooks gate on `useCurrentCustomer()`.
 */

const ORDERS_BASE = "/storefront/orders";

/** Orders per page in the account history. The API's cap is 100. */
export const ORDERS_PAGE_SIZE = 10;

/**
 * Places the order. The server prices every line from the variant, applies the configured
 * shipping fee and reserves stock — so this is also where an out-of-stock line is rejected,
 * with a 400 the checkout surfaces as-is.
 */
export async function createOrder(apiBaseUrl: string, payload: CreateOrderPayload): Promise<Order> {
    const data = await apiFetch<unknown>(apiBaseUrl, ORDERS_BASE, {
        method: "POST",
        body: JSON.stringify(payload)
    });

    return mapOrder(parseResponse(orderDtoSchema, data));
}

export async function fetchMyOrders(apiBaseUrl: string, page: number): Promise<OrderPage> {
    const search = new URLSearchParams({
        limit: String(ORDERS_PAGE_SIZE),
        skip: String((page - 1) * ORDERS_PAGE_SIZE)
    });

    const data = await apiFetch<unknown>(apiBaseUrl, `${ORDERS_BASE}?${search.toString()}`);

    return mapOrderPage(parseResponse(orderPageDtoSchema, data));
}

export async function fetchMyOrder(apiBaseUrl: string, orderId: number): Promise<Order> {
    const data = await apiFetch<unknown>(apiBaseUrl, `${ORDERS_BASE}/${orderId}`);

    return mapOrder(parseResponse(orderDtoSchema, data));
}

/** Only a PENDING order can be cancelled; the API releases the reserved stock as it does. */
export async function cancelMyOrder(apiBaseUrl: string, orderId: number): Promise<Order> {
    const data = await apiFetch<unknown>(apiBaseUrl, `${ORDERS_BASE}/${orderId}/cancel`, { method: "POST" });

    return mapOrder(parseResponse(orderDtoSchema, data));
}
