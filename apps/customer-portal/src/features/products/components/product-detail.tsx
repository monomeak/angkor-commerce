"use client";

import { useState } from "react";
import { Star } from "lucide-react";
import Image from "next/image";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { useCart } from "@/src/features/cart/lib/cart-context";
import { getDiscountedPrice, getSizeOptions } from "../lib/product-helpers";
import type { Product } from "../types/product";

type ProductDetailProps = {
    readonly product: Product;
    readonly categoryName: string;
};

export function ProductDetail({ product, categoryName }: ProductDetailProps) {
    const hasDiscount = product.promotionPercentage > 0;
    const discountedPrice = getDiscountedPrice(product);
    const sizeOptions = getSizeOptions(categoryName);
    const [selectedSize, setSelectedSize] = useState(sizeOptions[0]);
    const [quantity, setQuantity] = useState(1);
    const { addItem } = useCart();

    return (
        <div className="mt-6 grid gap-8 lg:grid-cols-2">
            <div className="relative flex aspect-square items-center justify-center overflow-hidden rounded-2xl bg-gradient-to-br from-muted to-muted/40">
                <Image src="/image.png" alt={product.name} width={400} height={400} />
                {hasDiscount && (
                    <Badge variant="destructive" className="absolute top-3 left-3">
                        -{product.promotionPercentage}%
                    </Badge>
                )}
            </div>

            <div className="flex flex-col gap-5">
                <div>
                    <p className="text-sm font-medium text-muted-foreground">{categoryName}</p>
                    <h1 className="mt-1 text-3xl font-semibold tracking-[-0.03em]">{product.name}</h1>
                    <div className="mt-2 flex items-center gap-1 text-sm text-muted-foreground">
                        <Star className="size-4 fill-current text-accent" />
                        {product.rating.toFixed(1)}
                    </div>
                </div>

                <div className="flex items-baseline gap-3">
                    <span className="text-3xl font-bold">${discountedPrice.toFixed(2)}</span>
                    {hasDiscount && (
                        <span className="text-lg text-muted-foreground line-through">
                            ${product.price.toFixed(2)}
                        </span>
                    )}
                </div>

                <p className="text-muted-foreground">{product.description}</p>

                <div>
                    <p className="mb-2 text-sm font-medium">What is your size?</p>
                    <div className="flex flex-wrap gap-2">
                        {sizeOptions.map((size) => (
                            <button
                                key={size}
                                type="button"
                                onClick={() => setSelectedSize(size)}
                                aria-pressed={size === selectedSize}
                                className={cn(
                                    "flex h-10 min-w-10 items-center justify-center rounded-full border px-3 text-sm font-medium transition-colors",
                                    size === selectedSize
                                        ? "border-primary bg-primary text-primary-foreground"
                                        : "border-border text-muted-foreground hover:border-primary hover:text-foreground"
                                )}
                            >
                                {size}
                            </button>
                        ))}
                    </div>
                </div>

                <div>
                    <p className="mb-2 text-sm font-medium">Quantity</p>
                    <div className="flex w-fit items-center rounded-full border">
                        <button
                            type="button"
                            onClick={() => setQuantity((value) => Math.max(1, value - 1))}
                            className="flex size-10 items-center justify-center text-lg text-muted-foreground transition-colors hover:text-foreground"
                            aria-label="Decrease quantity"
                        >
                            −
                        </button>
                        <span className="w-10 text-center text-sm font-medium">{quantity}</span>
                        <button
                            type="button"
                            onClick={() => setQuantity((value) => Math.min(product.quantity, value + 1))}
                            className="flex size-10 items-center justify-center text-lg text-muted-foreground transition-colors hover:text-foreground"
                            aria-label="Increase quantity"
                        >
                            +
                        </button>
                    </div>
                    <p className="mt-1 text-xs text-muted-foreground">{product.quantity} in stock</p>
                </div>

                <Button
                    variant="accent"
                    size="lg"
                    className="h-12 w-full text-sm sm:w-auto sm:px-10"
                    onClick={() => addItem(product.id, selectedSize, quantity)}
                >
                    Add to cart
                </Button>
            </div>
        </div>
    );
}
