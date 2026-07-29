import { getDescendantCategoryIds } from "@/src/features/categories/lib/category-helpers";
import type { Product } from "../types/product";

export function getDiscountedPrice(product: Product): number {
  const discount = (product.price * product.promotionPercentage) / 100;
  return Math.round((product.price - discount) * 100) / 100;
}

export function filterProductsByCategory(
  products: Product[],
  categoryId: number,
): Product[] {
  const allowedCategoryIds = new Set(getDescendantCategoryIds(categoryId));
  return products.filter((product) => allowedCategoryIds.has(product.categoryId));
}
