"use client";

import { useState } from "react";
import { Heart, Star } from "lucide-react";
import Link from "next/link";
import Image from "next/image";

import { getCategoryById } from "@/src/features/categories/lib/category-helpers";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { useCart } from "@/src/features/cart/lib/cart-context";
import { getDiscountedPrice, getSizeOptions } from "../lib/product-helpers";
import type { Product } from "../types/product";

type ProductCardProps = {
    readonly product: Product;
    readonly className?: string;
};

export function ProductCard({ product, className }: ProductCardProps) {
    const category = getCategoryById(product.categoryId);
    const hasDiscount = product.promotionPercentage > 0;
    const discountedPrice = getDiscountedPrice(product);
    const sizeOptions = getSizeOptions(category?.name ?? "");
    const [selectedSize, setSelectedSize] = useState(sizeOptions[0]);
    const [isFavorite, setIsFavorite] = useState(false);
    const detailHref = category ? `/product/${category.slug}/${product.id}` : undefined;
    const { addItem } = useCart();

    return (
        <Card
            className={cn(
                "gap-4 p-3 transition-transform duration-300 hover:-translate-y-1 hover:ring-primary/50",
                className
            )}
        >
            <Link
                href={detailHref ?? "#"}
                className="relative flex aspect-square items-center justify-center overflow-hidden rounded-xl bg-gradient-to-br from-muted to-muted/40"
            >
                <Image src="/image.png" alt={product.name} width={200} height={200} />
                {hasDiscount && (
                    <Badge variant="destructive" className="absolute top-2 left-2">
                        -{product.promotionPercentage}%
                    </Badge>
                )}
                <button
                    type="button"
                    onClick={(event) => {
                        event.preventDefault();
                        event.stopPropagation();
                        setIsFavorite((value) => !value);
                    }}
                    aria-pressed={isFavorite}
                    aria-label={isFavorite ? "Remove from favorites" : "Add to favorites"}
                    className="absolute top-2 right-2 flex size-8 items-center justify-center rounded-full bg-background/80 text-muted-foreground shadow-sm transition-colors hover:text-destructive"
                >
                    <Heart className={cn("size-4", isFavorite && "fill-destructive text-destructive")} />
                </button>
            </Link>

            <div className="flex flex-col gap-3 px-1">
                <div className="flex items-start justify-between gap-3">
                    <h3 className="font-semibold">
                        <Link href={detailHref ?? "#"} className="hover:underline">
                            {product.name}
                        </Link>{" "}
                        <span className="text-sm font-normal text-muted-foreground">
                            ({product.rating.toFixed(1)}
                            <Star className="mb-0.5 ml-0.5 inline size-3 fill-current" />)
                        </span>
                    </h3>
                    <div className="flex shrink-0 flex-col items-end">
                        <span className="text-lg font-bold">${discountedPrice.toFixed(2)}</span>
                        {hasDiscount && (
                            <span className="text-xs text-muted-foreground line-through">
                                ${product.price.toFixed(2)}
                            </span>
                        )}
                    </div>
                </div>

                <p className="line-clamp-2 text-sm text-muted-foreground">{product.description}</p>

                <div>
                    <p className="mb-2 text-sm">What is your size?</p>
                    <div className="flex flex-wrap gap-2">
                        {sizeOptions.map((size) => (
                            <button
                                key={size}
                                type="button"
                                onClick={() => setSelectedSize(size)}
                                aria-pressed={size === selectedSize}
                                className={cn(
                                    "flex h-9 min-w-9 items-center justify-center rounded-full border px-2 text-sm font-medium transition-colors",
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

                <Button
                    variant="accent"
                    size="lg"
                    className="w-full"
                    onClick={() => addItem(product.id, selectedSize)}
                >
                    Add to cart
                </Button>
            </div>
        </Card>
    );
}
