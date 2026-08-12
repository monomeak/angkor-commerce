import type { Category } from "../types/category";

/**
 * The catalogue juggles three ways of naming a category and each layer wants a different one:
 *
 *   - the API filters by `categoryId` or `categorySlug`
 *   - the product list row only carries a category *name* (ProductSummaryResponse flattens it,
 *     dropping the id) — so going from a row back to a filter needs name → id
 *   - the URL should carry something a person can read and share
 *
 * Building the maps once per category list keeps those conversions in one place instead of
 * scattering `find()` calls through the components.
 */
export interface CategoryLookup {
    byId: Map<number, Category>;
    bySlug: Map<string, Category>;
    /** Lowercased name → category. Names are not unique across branches; see below. */
    byName: Map<string, Category>;
    /** Names that appear on more than one category, so callers can avoid a wrong guess. */
    ambiguousNames: Set<string>;
}

export function buildCategoryLookup(categories: Category[]): CategoryLookup {
    const byId = new Map<number, Category>();
    const bySlug = new Map<string, Category>();
    const byName = new Map<string, Category>();
    const ambiguousNames = new Set<string>();

    for (const category of categories) {
        byId.set(category.id, category);
        bySlug.set(category.slug, category);

        const nameKey = category.name.trim().toLowerCase();
        if (byName.has(nameKey)) {
            // "Shirt" exists under both Men and Women in the seed data.
            ambiguousNames.add(nameKey);
        } else {
            byName.set(nameKey, category);
        }
    }

    return { byId, bySlug, byName, ambiguousNames };
}

export function categoryIdFromSlug(lookup: CategoryLookup, slug: string | undefined): number | undefined {
    if (!slug) return undefined;

    return lookup.bySlug.get(slug)?.id;
}

export function categorySlugFromId(lookup: CategoryLookup, id: number | undefined): string | undefined {
    if (id === undefined) return undefined;

    return lookup.byId.get(id)?.slug;
}

export function categoryNameFromSlug(lookup: CategoryLookup, slug: string | undefined): string | undefined {
    if (!slug) return undefined;

    return lookup.bySlug.get(slug)?.name;
}

/**
 * Resolves a display name back to a category — the only route available from a product list
 * row, which has no category id.
 *
 * Returns undefined when the name is ambiguous rather than picking the first match: filtering
 * by the wrong "Shirt" looks like a broken filter, whereas not linking is merely unremarkable.
 */
export function categoryFromName(lookup: CategoryLookup, name: string | null | undefined): Category | undefined {
    if (!name) return undefined;

    const key = name.trim().toLowerCase();
    if (lookup.ambiguousNames.has(key)) return undefined;

    return lookup.byName.get(key);
}
