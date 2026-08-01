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

export function getProductById(products: Product[], id: number): Product | undefined {
  return products.find((product) => product.id === id);
}

export function filterProductsByQuery(products: Product[], query: string): Product[] {
  const normalized = query.trim().toLowerCase();
  if (!normalized) {
    return products;
  }

  return products.filter(
    (product) =>
      product.name.toLowerCase().includes(normalized) ||
      product.description.toLowerCase().includes(normalized),
  );
}

export function filterProductsByPriceRange(
  products: Product[],
  minPrice: number,
  maxPrice: number,
): Product[] {
  return products.filter((product) => {
    const price = getDiscountedPrice(product);
    return price >= minPrice && price <= maxPrice;
  });
}
