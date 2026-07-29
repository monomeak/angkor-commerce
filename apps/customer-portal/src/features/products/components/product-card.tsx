"use client";

import { useState } from "react";
import { Star } from "lucide-react";

import { getCategoryById } from "@/src/features/categories/lib/category-helpers";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { getDiscountedPrice, getSizeOptions } from "../lib/product-helpers";
import type { Product } from "../types/product";
import { ProductIcon } from "./product-icon";

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

  return (
    <Card
      className={cn(
        "gap-4 p-3 transition-transform duration-300 hover:-translate-y-1 hover:ring-primary/50",
        className,
      )}
    >
      <div className="relative flex aspect-square items-center justify-center overflow-hidden rounded-xl bg-gradient-to-br from-muted to-muted/40">
        <ProductIcon
          categoryName={category?.name ?? ""}
          className="size-12 text-muted-foreground"
        />
        {hasDiscount && (
          <Badge variant="destructive" className="absolute top-2 left-2">
            -{product.promotionPercentage}%
          </Badge>
        )}
      </div>

      <div className="flex flex-col gap-3 px-1">
        <div className="flex items-start justify-between gap-3">
          <h3 className="font-semibold">
            {product.name}{" "}
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
                    : "border-border text-muted-foreground hover:border-primary hover:text-foreground",
                )}
              >
                {size}
              </button>
            ))}
          </div>
        </div>

        <Button variant="accent" size="lg" className="w-full">
          Add to cart
        </Button>
      </div>
    </Card>
  );
}
