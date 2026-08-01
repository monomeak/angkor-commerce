"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";

import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { useCart } from "@/src/features/cart/lib/cart-context";
import { addOrder } from "@/src/features/orders/lib/orders-storage";
import type { Order, PaymentMethod, ShippingAddress } from "@/src/features/orders/types/order";
import { CardSelector } from "@/src/features/payment-methods/components/card-selector";
import { CARD_BRAND_LABEL } from "@/src/features/payment-methods/lib/card-brand";
import type { SavedCard } from "@/src/features/payment-methods/types/payment-method";
import { products } from "@/src/features/products/data/products.data";
import { getDiscountedPrice, getProductById } from "@/src/features/products/lib/product-helpers";
import { generateOrderNumber, SHIPPING_FEE } from "../lib/order-helpers";
import { clearShippingDraft, getShippingDraft } from "../lib/shipping-draft-storage";

export function CheckoutForm() {
  const router = useRouter();
  const { items, clearCart } = useCart();
  const [shippingAddress, setShippingAddress] = useState<ShippingAddress | null | undefined>(
    undefined,
  );
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>("cod");
  const [selectedCard, setSelectedCard] = useState<SavedCard | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setShippingAddress(getShippingDraft());
  }, []);

  useEffect(() => {
    if (shippingAddress === null) {
      router.replace("/shipping");
    }
  }, [shippingAddress, router]);

  function handlePlaceOrder() {
    if (!shippingAddress || items.length === 0) {
      return;
    }

    if (paymentMethod === "card" && !selectedCard) {
      setError("Select or add a card to pay with.");
      return;
    }

    const lines = items.flatMap((item) => {
      const product = getProductById(products, item.productId);
      return product
        ? [
            {
              productId: product.id,
              name: product.name,
              size: item.size,
              quantity: item.quantity,
              unitPrice: getDiscountedPrice(product),
            },
          ]
        : [];
    });

    const subtotal = lines.reduce((sum, line) => sum + line.unitPrice * line.quantity, 0);

    const order: Order = {
      orderNumber: generateOrderNumber(),
      placedAt: new Date().toISOString(),
      items: lines,
      shippingAddress,
      paymentMethod,
      card:
        paymentMethod === "card" && selectedCard
          ? { brand: CARD_BRAND_LABEL[selectedCard.brand], last4: selectedCard.last4 }
          : undefined,
      subtotal,
      shippingFee: SHIPPING_FEE,
      total: subtotal + SHIPPING_FEE,
    };

    setError(null);
    addOrder(order);
    clearCart();
    clearShippingDraft();
    router.push(`/checkout/confirmation/${order.orderNumber}`);
  }

  if (items.length === 0) {
    return (
      <div className="flex flex-col items-center gap-3 rounded-2xl border bg-card p-10 text-center">
        <p className="text-muted-foreground">Your cart is empty.</p>
        <Button nativeButton={false} render={<Link href="/" />}>
          Continue shopping
        </Button>
      </div>
    );
  }

  if (!shippingAddress) {
    return null;
  }

  return (
    <div className="flex flex-col gap-4">
      <div className="rounded-2xl border bg-card p-6">
        <div className="flex items-center justify-between">
          <h2 className="font-semibold">Shipping to</h2>
          <Link href="/shipping" className="text-sm text-primary hover:underline">
            Edit
          </Link>
        </div>
        <div className="mt-2 text-sm text-muted-foreground">
          <p className="text-foreground">{shippingAddress.fullName}</p>
          <p>{shippingAddress.phone}</p>
          <p>
            {shippingAddress.address}, {shippingAddress.city}
            {shippingAddress.postalCode ? ` ${shippingAddress.postalCode}` : ""}
          </p>
          {shippingAddress.notes && <p>Notes: {shippingAddress.notes}</p>}
        </div>
      </div>

      <div className="rounded-2xl border bg-card p-6">
        <h2 className="font-semibold">Payment method</h2>
        <RadioGroup
          value={paymentMethod}
          onValueChange={(value) => setPaymentMethod(value as PaymentMethod)}
          className="mt-4"
        >
          <Label className="flex items-center gap-2 text-sm font-normal">
            <RadioGroupItem value="cod" />
            Cash on delivery
          </Label>
          <Label className="flex items-center gap-2 text-sm font-normal">
            <RadioGroupItem value="card" />
            Card
          </Label>
        </RadioGroup>

        {paymentMethod === "card" && (
          <CardSelector
            selectedCardId={selectedCard?.id ?? null}
            onSelect={(card) => {
              setSelectedCard(card);
              setError(null);
            }}
          />
        )}
      </div>

      {error && <p className="text-sm text-destructive">{error}</p>}

      <Button variant="accent" size="lg" className="w-full" onClick={handlePlaceOrder}>
        Place order
      </Button>
    </div>
  );
}
