"use client";

import Image from "next/image";
import Link from "next/link";
import { Minus, Plus, ShoppingCart, Trash2 } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetFooter,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { getCategoryById } from "@/src/features/categories/lib/category-helpers";
import { products } from "@/src/features/products/data/products.data";
import { getDiscountedPrice, getProductById } from "@/src/features/products/lib/product-helpers";
import type { Product } from "@/src/features/products/types/product";
import { useCart } from "../lib/cart-context";
import type { CartItem } from "../types/cart";

type CartLine = { item: CartItem; product: Product };

export function CartSheet() {
  const { items, itemCount, isOpen, setOpen, removeItem, updateQuantity } = useCart();

  const lines: CartLine[] = items.flatMap((item) => {
    const product = getProductById(products, item.productId);
    return product ? [{ item, product }] : [];
  });

  const subtotal = lines.reduce(
    (sum, { item, product }) => sum + getDiscountedPrice(product) * item.quantity,
    0,
  );

  return (
    <Sheet open={isOpen} onOpenChange={setOpen}>
      <SheetTrigger
        render={<Button variant="ghost" size="icon" aria-label="Cart" className="relative" />}
      >
        <ShoppingCart className="size-5" />
        {itemCount > 0 && (
          <Badge
            variant="destructive"
            className="absolute -top-1 -right-1 h-4 min-w-4 justify-center rounded-full px-1 text-[10px]"
          >
            {itemCount}
          </Badge>
        )}
      </SheetTrigger>

      <SheetContent side="right" className="flex w-full flex-col sm:max-w-md">
        <SheetHeader>
          <SheetTitle>Your cart</SheetTitle>
        </SheetHeader>

        {lines.length === 0 ? (
          <div className="flex flex-1 flex-col items-center justify-center gap-3 px-4 text-center">
            <ShoppingCart className="size-10 text-muted-foreground" />
            <p className="text-sm text-muted-foreground">Your cart is empty.</p>
            <Button nativeButton={false} render={<Link href="/" />}>
              Continue shopping
            </Button>
          </div>
        ) : (
          <>
            <div className="flex-1 overflow-y-auto px-4">
              <ul className="flex flex-col gap-4">
                {lines.map(({ item, product }) => {
                  const category = getCategoryById(product.categoryId);
                  const price = getDiscountedPrice(product);

                  return (
                    <li key={`${item.productId}-${item.size}`} className="flex gap-3">
                      <div className="relative flex size-16 shrink-0 items-center justify-center overflow-hidden rounded-lg bg-gradient-to-br from-muted to-muted/40">
                        <Image src="/image.png" alt={product.name} width={56} height={56} />
                      </div>

                      <div className="flex flex-1 flex-col gap-1">
                        <div className="flex items-start justify-between gap-2">
                          <div>
                            <p className="text-sm font-medium">{product.name}</p>
                            <p className="text-xs text-muted-foreground">
                              {category?.name} · Size {item.size}
                            </p>
                          </div>
                          <button
                            type="button"
                            onClick={() => removeItem(item.productId, item.size)}
                            aria-label={`Remove ${product.name} from cart`}
                            className="text-muted-foreground transition-colors hover:text-destructive"
                          >
                            <Trash2 className="size-4" />
                          </button>
                        </div>

                        <div className="flex items-center justify-between">
                          <div className="flex items-center rounded-full border">
                            <button
                              type="button"
                              onClick={() =>
                                updateQuantity(item.productId, item.size, item.quantity - 1)
                              }
                              aria-label="Decrease quantity"
                              className="flex size-7 items-center justify-center text-muted-foreground transition-colors hover:text-foreground"
                            >
                              <Minus className="size-3" />
                            </button>
                            <span className="w-6 text-center text-sm">{item.quantity}</span>
                            <button
                              type="button"
                              onClick={() =>
                                updateQuantity(item.productId, item.size, item.quantity + 1)
                              }
                              aria-label="Increase quantity"
                              className="flex size-7 items-center justify-center text-muted-foreground transition-colors hover:text-foreground"
                            >
                              <Plus className="size-3" />
                            </button>
                          </div>
                          <span className="text-sm font-semibold">
                            ${(price * item.quantity).toFixed(2)}
                          </span>
                        </div>
                      </div>
                    </li>
                  );
                })}
              </ul>
            </div>

            <SheetFooter className="border-t">
              <div className="flex items-center justify-between text-sm font-medium">
                <span>Subtotal</span>
                <span>${subtotal.toFixed(2)}</span>
              </div>
              <Button disabled className="w-full">
                Checkout
              </Button>
            </SheetFooter>
          </>
        )}
      </SheetContent>
    </Sheet>
  );
}
