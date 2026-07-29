import { getCategoryById } from "@/src/features/categories/lib/category-helpers";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { getDiscountedPrice } from "../lib/product-helpers";
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

  return (
    <Card
      className={cn(
        "gap-0 overflow-hidden py-0 transition-[transform,box-shadow] duration-300 hover:-translate-y-1 hover:ring-primary/50",
        className,
      )}
    >
      <div className="relative flex aspect-square items-center justify-center bg-gradient-to-br from-muted to-muted/40">
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
      <CardContent className="flex flex-col gap-1 px-4 pt-4">
        {category && (
          <span className="text-xs text-muted-foreground">{category.name}</span>
        )}
        <span className="line-clamp-1 text-sm font-medium">{product.name}</span>
      </CardContent>
      <CardFooter className="flex items-center gap-2 px-4 pb-4">
        <span className="text-sm font-semibold">${discountedPrice.toFixed(2)}</span>
        {hasDiscount && (
          <span className="text-xs text-muted-foreground line-through">
            ${product.price.toFixed(2)}
          </span>
        )}
      </CardFooter>
    </Card>
  );
}
