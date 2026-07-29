import type { Order } from "../types/order";

function getPaymentMethodLabel(order: Order): string {
  if (order.paymentMethod === "cod") {
    return "Cash on delivery";
  }

  return order.card ? `${order.card.brand} •••• ${order.card.last4}` : "Card";
}

export function OrderCard({ order }: { readonly order: Order }) {
  const placedAtLabel = new Date(order.placedAt).toLocaleDateString(undefined, {
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  return (
    <div className="rounded-2xl border bg-card p-5">
      <div className="flex flex-wrap items-start justify-between gap-2">
        <div>
          <p className="font-semibold">Order #{order.orderNumber}</p>
          <p className="text-sm text-muted-foreground">Placed on {placedAtLabel}</p>
        </div>
        <span className="text-sm font-medium text-muted-foreground">
          {getPaymentMethodLabel(order)}
        </span>
      </div>

      <ul className="mt-4 flex flex-col gap-2 border-t pt-4">
        {order.items.map((line) => (
          <li
            key={`${line.productId}-${line.size}`}
            className="flex items-center justify-between gap-4 text-sm"
          >
            <span className="text-foreground">
              {line.name}{" "}
              <span className="text-muted-foreground">
                (Size {line.size} × {line.quantity})
              </span>
            </span>
            <span className="shrink-0 font-medium">
              ${(line.unitPrice * line.quantity).toFixed(2)}
            </span>
          </li>
        ))}
      </ul>

      <div className="mt-4 flex flex-col gap-1 border-t pt-4 text-sm">
        <div className="flex items-center justify-between text-muted-foreground">
          <span>Subtotal</span>
          <span>${order.subtotal.toFixed(2)}</span>
        </div>
        <div className="flex items-center justify-between text-muted-foreground">
          <span>Shipping</span>
          <span>${order.shippingFee.toFixed(2)}</span>
        </div>
        <div className="flex items-center justify-between font-semibold text-foreground">
          <span>Total</span>
          <span>${order.total.toFixed(2)}</span>
        </div>
      </div>
    </div>
  );
}
