import { categories } from "../data/categories.data";
import type { Category } from "../types/category";

export function getTopLevelCategories(): Category[] {
  return categories.filter((category) => category.parentId === null);
}

export function getChildCategories(parentId: number): Category[] {
  return categories.filter((category) => category.parentId === parentId);
}

export function getCategoryBySlug(slug: string): Category | undefined {
  return categories.find((category) => category.slug === slug);
}

export function getCategoryById(id: number): Category | undefined {
  return categories.find((category) => category.id === id);
}

// A product's categoryId points at one leaf (e.g. "men-t-shirt"). Filtering
// by a top-level or intermediate category means matching that category plus
// every category beneath it in the tree.
export function getDescendantCategoryIds(categoryId: number): number[] {
  const ids = [categoryId];
  const children = categories.filter((category) => category.parentId === categoryId);

  for (const child of children) {
    ids.push(...getDescendantCategoryIds(child.id));
  }

  return ids;
}
