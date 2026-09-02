"use client";

import { useAppConfig } from "@/components/providers/app-config-provider";
import { useCart } from "@/src/features/cart/lib/cart-context";
import { formatPrice } from "@/src/features/products/lib/pricing";

/**
 * What is in the cart, priced from the snapshot each line kept. Only the subtotal is shown:
 * shipping is `angkor.order.shipping-fee` on the API and the order's real total comes back
 * from `POST /storefront/orders`, so anything else here would be the client guessing.
 */
export function OrderSummary() {
    const { locale } = useAppConfig();
    const { items, subtotal } = useCart();

    const currency = items[0]?.currency ?? "USD";

    return (
        <div className="rounded-2xl border bg-card p-5">
            <h2 className="font-semibold">Order summary</h2>

            {items.length === 0 ? (
                <p className="mt-4 text-sm text-muted-foreground">Your cart is empty.</p>
            ) : (
                <>
                    <ul className="mt-4 flex flex-col gap-2 border-t pt-4">
                        {items.map((item) => (
                            <li key={item.variantId} className="flex items-center justify-between gap-4 text-sm">
                                <span className="text-foreground">
                                    {item.name}{" "}
                                    <span className="text-muted-foreground">
                                        ({item.size} × {item.quantity})
                                    </span>
                                </span>
                                <span className="shrink-0 font-medium">
                                    {formatPrice(item.unitPrice * item.quantity, item.currency, locale)}
                                </span>
                            </li>
                        ))}
                    </ul>

                    <div className="mt-4 flex flex-col gap-1 border-t pt-4 text-sm">
                        <div className="flex items-center justify-between font-semibold text-foreground">
                            <span>Subtotal</span>
                            <span>{formatPrice(subtotal, currency, locale)}</span>
                        </div>
                        <p className="text-xs text-muted-foreground">
                            Delivery is added when the order is placed, and prices are confirmed against the
                            catalogue then.
                        </p>
                    </div>
                </>
            )}
        </div>
    );
}
