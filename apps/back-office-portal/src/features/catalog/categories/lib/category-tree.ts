import type { Category, CategoryOption } from "../types/category";

/**
 * The API returns a flat list carrying parentId, and several children share a name
 * ("Shirt" exists under both Men and Women in the seed data). A bare name list would be
 * ambiguous, so each option is labelled with its ancestry.
 */
export function toCategoryOptions(categories: Category[]): CategoryOption[] {
    const byId = new Map(categories.map((category) => [category.id, category]));

    const labelFor = (category: Category): string => {
        const segments = [category.name];
        const seen = new Set<number>([category.id]);

        let parentId = category.parentId;
        // Guard against a cycle in the data rather than hanging the render.
        while (parentId !== null && !seen.has(parentId)) {
            const parent = byId.get(parentId);
            if (!parent) break;

            segments.unshift(parent.name);
            seen.add(parent.id);
            parentId = parent.parentId;
        }

        return segments.join(" › ");
    };

    return categories
        .map((category) => ({ id: category.id, label: labelFor(category) }))
        .sort((a, b) => a.label.localeCompare(b.label));
}

/**
 * Depth-first ordering so children follow their parent, with `depth` for indentation.
 *
 * Anything whose parent is missing from the list is treated as a root rather than dropped —
 * losing a category from the management screen is worse than showing it at the wrong level.
 */
export function sortCategoriesAsTree(categories: Category[]): Array<{ category: Category; depth: number }> {
    const ids = new Set(categories.map((category) => category.id));
    const childrenOf = new Map<number | null, Category[]>();

    for (const category of categories) {
        const parentKey = category.parentId !== null && ids.has(category.parentId) ? category.parentId : null;
        const siblings = childrenOf.get(parentKey) ?? [];
        siblings.push(category);
        childrenOf.set(parentKey, siblings);
    }

    for (const siblings of childrenOf.values()) {
        siblings.sort((a, b) => a.sortOrder - b.sortOrder || a.name.localeCompare(b.name));
    }

    const rows: Array<{ category: Category; depth: number }> = [];
    const visited = new Set<number>();

    const walk = (parentKey: number | null, depth: number) => {
        for (const category of childrenOf.get(parentKey) ?? []) {
            // A cycle in the data would otherwise recurse until the stack gives out.
            if (visited.has(category.id)) continue;

            visited.add(category.id);
            rows.push({ category, depth });
            walk(category.id, depth + 1);
        }
    };

    walk(null, 0);

    return rows;
}
