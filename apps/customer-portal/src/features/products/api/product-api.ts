import { getCategoryBySlug } from "@/src/features/categories/lib/category-helpers";
import { products } from "../data/products.data";
import {
  filterProductsByCategory,
  filterProductsByPriceRange,
  filterProductsByQuery,
} from "../lib/product-helpers";
import type { Product } from "../types/product";

// No backend yet (see docs/NEXTJS_MIGRATION_PLAN.md). These resolve against
// local mock data but are shaped like future HTTP calls to apps/core-api.
export async function fetchProducts(filters?: {
  categorySlug?: string;
  query?: string;
  minPrice?: number;
  maxPrice?: number;
}): Promise<Product[]> {
  let results = products;

  if (filters?.categorySlug) {
    const category = getCategoryBySlug(filters.categorySlug);
    results = category ? filterProductsByCategory(results, category.id) : [];
  }

  if (filters?.query) {
    results = filterProductsByQuery(results, filters.query);
  }

  if (filters?.minPrice !== undefined && filters?.maxPrice !== undefined) {
    results = filterProductsByPriceRange(results, filters.minPrice, filters.maxPrice);
  }

  return results;
}

export async function fetchProductById(id: number): Promise<Product | null> {
  return products.find((product) => product.id === id) ?? null;
}
