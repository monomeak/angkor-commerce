import { getCategoryBySlug } from "@/src/features/categories/lib/category-helpers";
import { products } from "../data/products.data";
import { filterProductsByCategory } from "../lib/product-helpers";
import type { Product } from "../types/product";

// No backend yet (see docs/NEXTJS_MIGRATION_PLAN.md). These resolve against
// local mock data but are shaped like future HTTP calls to apps/core-api.
export async function fetchProducts(filters?: {
  categorySlug?: string;
}): Promise<Product[]> {
  if (!filters?.categorySlug) {
    return products;
  }

  const category = getCategoryBySlug(filters.categorySlug);
  if (!category) {
    return [];
  }

  return filterProductsByCategory(products, category.id);
}

export async function fetchProductById(id: number): Promise<Product | null> {
  return products.find((product) => product.id === id) ?? null;
}
