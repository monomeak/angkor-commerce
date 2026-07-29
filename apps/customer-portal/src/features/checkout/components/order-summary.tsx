"use client";

import { useCart } from "@/src/features/cart/lib/cart-context";
import { products } from "@/src/features/products/data/products.data";
import { getDiscountedPrice, getProductById } from "@/src/features/products/lib/product-helpers";
import { SHIPPING_FEE } from "../lib/order-helpers";

export function OrderSummary() {
  const { items } = useCart();

  const lines = items.flatMap((item) => {
    const product = getProductById(products, item.productId);
    return product ? [{ item, product }] : [];
  });

  const subtotal = lines.reduce(
    (sum, { item, product }) => sum + getDiscountedPrice(product) * item.quantity,
    0,
  );
  const shippingFee = lines.length > 0 ? SHIPPING_FEE : 0;
  const total = subtotal + shippingFee;

  return (
    <div className="rounded-2xl border bg-card p-5">
      <h2 className="font-semibold">Order summary</h2>

      {lines.length === 0 ? (
        <p className="mt-4 text-sm text-muted-foreground">Your cart is empty.</p>
      ) : (
        <>
          <ul className="mt-4 flex flex-col gap-2 border-t pt-4">
            {lines.map(({ item, product }) => (
              <li
                key={`${item.productId}-${item.size}`}
                className="flex items-center justify-between gap-4 text-sm"
              >
                <span className="text-foreground">
                  {product.name}{" "}
                  <span className="text-muted-foreground">
                    (Size {item.size} × {item.quantity})
                  </span>
                </span>
                <span className="shrink-0 font-medium">
                  ${(getDiscountedPrice(product) * item.quantity).toFixed(2)}
                </span>
              </li>
            ))}
          </ul>

          <div className="mt-4 flex flex-col gap-1 border-t pt-4 text-sm">
            <div className="flex items-center justify-between text-muted-foreground">
              <span>Subtotal</span>
              <span>${subtotal.toFixed(2)}</span>
            </div>
            <div className="flex items-center justify-between text-muted-foreground">
              <span>Shipping</span>
              <span>${shippingFee.toFixed(2)}</span>
            </div>
            <div className="flex items-center justify-between font-semibold text-foreground">
              <span>Total</span>
              <span>${total.toFixed(2)}</span>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
