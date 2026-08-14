import type { Category } from "../types/category";

/*
 * Pure shaping over a category list the caller supplies. They used to read the mock
 * categories.data module directly, which made them unusable once the list came from
 * core-api — a server component awaits fetchCategories(), a client component reads
 * useCategories(), and neither can be reached from inside a helper. Passing the list in
 * also keeps it obvious at the call site which screens are still on mock data.
 */

export function getTopLevelCategories(categories: Category[]): Category[] {
    return categories.filter((category) => category.parentId === null);
}

export function getChildCategories(categories: Category[], parentId: number): Category[] {
    return categories
        .filter((category) => category.parentId === parentId)
        .sort((a, b) => (a.sortOrder ?? 0) - (b.sortOrder ?? 0) || a.name.localeCompare(b.name));
}

export function getCategoryBySlug(categories: Category[], slug: string): Category | undefined {
    return categories.find((category) => category.slug === slug);
}

export function getCategoryById(categories: Category[], id: number): Category | undefined {
    return categories.find((category) => category.id === id);
}

// A product's categoryId points at one leaf (e.g. "men-t-shirt"). Filtering by a top-level
// or intermediate category means matching that category plus every category beneath it.
//
// core-api now does this expansion itself for product listings (CategoryService
// .getDescendantCategoryIds), so this is only for filtering a list already in hand.
export function getDescendantCategoryIds(categories: Category[], categoryId: number): number[] {
    const ids = [categoryId];

    for (const child of categories.filter((category) => category.parentId === categoryId)) {
        ids.push(...getDescendantCategoryIds(categories, child.id));
    }

    return ids;
}
