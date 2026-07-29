import type { Order } from "../types/order";

const ORDERS_STORAGE_KEY = "angkor-customer-orders";

function isOrder(value: unknown): value is Order {
  return (
    typeof value === "object" &&
    value !== null &&
    typeof (value as Order).orderNumber === "string" &&
    typeof (value as Order).placedAt === "string" &&
    Array.isArray((value as Order).items)
  );
}

export function getOrders(): Order[] {
  try {
    const raw: unknown = JSON.parse(localStorage.getItem(ORDERS_STORAGE_KEY) ?? "[]");
    return Array.isArray(raw) ? raw.filter(isOrder) : [];
  } catch {
    return [];
  }
}

export function getOrderByNumber(orderNumber: string): Order | undefined {
  return getOrders().find((order) => order.orderNumber === orderNumber);
}

export function addOrder(order: Order): void {
  const next = [order, ...getOrders()];
  localStorage.setItem(ORDERS_STORAGE_KEY, JSON.stringify(next));
}
