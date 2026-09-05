"use client";

import Image from "next/image";
import Link from "next/link";
import { Minus, Plus, ShoppingCart, Trash2 } from "lucide-react";

import { useAppConfig } from "@/components/providers/app-config-provider";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetFooter, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { productImageSrc } from "@/src/features/products/lib/product-image";
import { formatPrice } from "@/src/features/products/lib/pricing";
import { useCart } from "../lib/cart-context";
import type { CartItem } from "../types/cart";

/** A cart line links back to where it was added from, when the snapshot knows the category. */
function productHref(item: CartItem): string | null {
    return item.categorySlug ? `/product/${item.categorySlug}/${item.productId}` : null;
}

export function CartSheet() {
    const { mediaBaseUrl, locale } = useAppConfig();
    const { items, itemCount, subtotal, isOpen, setOpen, removeItem, updateQuantity } = useCart();

    const currency = items[0]?.currency ?? "USD";

    return (
        <Sheet open={isOpen} onOpenChange={setOpen}>
            <SheetTrigger render={<Button variant="ghost" size="icon" aria-label="Cart" className="relative" />}>
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

                {items.length === 0 ? (
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
                                {items.map((item) => {
                                    const href = productHref(item);

                                    return (
                                        <li key={item.variantId} className="flex gap-3">
                                            <div className="relative flex size-16 shrink-0 items-center justify-center overflow-hidden rounded-lg bg-gradient-to-br from-muted to-muted/40">
                                                <Image
                                                    src={productImageSrc(mediaBaseUrl, item.thumbnail, item.name)}
                                                    alt={item.name}
                                                    width={56}
                                                    height={56}
                                                    unoptimized
                                                />
                                            </div>

                                            <div className="flex flex-1 flex-col gap-1">
                                                <div className="flex items-start justify-between gap-2">
                                                    <div>
                                                        {href ? (
                                                            <Link
                                                                href={href}
                                                                onClick={() => setOpen(false)}
                                                                className="text-sm font-medium hover:underline"
                                                            >
                                                                {item.name}
                                                            </Link>
                                                        ) : (
                                                            <p className="text-sm font-medium">{item.name}</p>
                                                        )}
                                                        <p className="text-xs text-muted-foreground">
                                                            {item.size} · {item.sku}
                                                        </p>
                                                    </div>
                                                    <button
                                                        type="button"
                                                        onClick={() => removeItem(item.variantId)}
                                                        aria-label={`Remove ${item.name} from cart`}
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
                                                                updateQuantity(item.variantId, item.quantity - 1)
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
                                                                updateQuantity(item.variantId, item.quantity + 1)
                                                            }
                                                            aria-label="Increase quantity"
                                                            className="flex size-7 items-center justify-center text-muted-foreground transition-colors hover:text-foreground"
                                                        >
                                                            <Plus className="size-3" />
                                                        </button>
                                                    </div>
                                                    <span className="text-sm font-semibold">
                                                        {formatPrice(item.unitPrice * item.quantity, item.currency, locale)}
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
                                <span>{formatPrice(subtotal, currency, locale)}</span>
                            </div>
                            <Button
                                className="w-full"
                                nativeButton={false}
                                onClick={() => setOpen(false)}
                                render={<Link href="/shipping" />}
                            >
                                Checkout
                            </Button>
                        </SheetFooter>
                    </>
                )}
            </SheetContent>
        </Sheet>
    );
}
