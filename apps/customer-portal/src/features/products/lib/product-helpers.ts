import { getDescendantCategoryIds } from "@/src/features/categories/lib/category-helpers";
import type { Product } from "../types/product";

export function getDiscountedPrice(product: Product): number {
  const discount = (product.price * product.promotionPercentage) / 100;
  return Math.round((product.price - discount) * 100) / 100;
}

const SHOE_SIZES = ["39", "40", "41", "42", "43", "44"];
const APPAREL_SIZES = ["S", "M", "L", "XL"];

export function getSizeOptions(categoryName: string): string[] {
  return categoryName.toLowerCase().includes("shoe") ? SHOE_SIZES : APPAREL_SIZES;
}

export function filterProductsByCategory(
  products: Product[],
  categoryId: number,
): Product[] {
  const allowedCategoryIds = new Set(getDescendantCategoryIds(categoryId));
  return products.filter((product) => allowedCategoryIds.has(product.categoryId));
}
