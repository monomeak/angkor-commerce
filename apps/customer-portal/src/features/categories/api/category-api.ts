import { apiFetch, parseResponse } from "@/lib/api-client";
import { categoryListDtoSchema } from "../schemas/category.schema";
import type { Category } from "../types/category";

const CATEGORIES_BASE = "/categories";

/**
 * Categories back the site nav, the footer and the browse pills — all rendered on the
 * server, on routes that are otherwise static.
 *
 * Without this, an uncached fetch is baked in at build time and the nav only changes on
 * redeploy. Revalidating turns those routes into ISR instead: still prerendered and fast,
 * but re-fetched in the background once the window lapses. The shop's category tree changes
 * about as often as its navigation does, so five minutes is generous.
 *
 * Ignored in the browser, where React Query owns the caching (see hooks/use-categories.ts).
 */
const REVALIDATE_SECONDS = 300;

/**
 * The whole tree in one call — core-api serves categories flat and unpaginated (a couple of
 * dozen rows), and every caller here needs the parent/child relationships to build a menu,
 * breadcrumb or pill row. `lib/category-helpers.ts` does that shaping.
 *
 * GET /categories is public, so this works for anonymous browsing.
 */
export async function fetchCategories(apiBaseUrl: string): Promise<Category[]> {
    const data = await apiFetch<unknown>(apiBaseUrl, CATEGORIES_BASE, {
        next: { revalidate: REVALIDATE_SECONDS }
    });

    return parseResponse(categoryListDtoSchema, data).map((dto) => ({
        id: dto.id,
        parentId: dto.parentId,
        name: dto.name,
        slug: dto.slug,
        sortOrder: dto.sortOrder ?? 0
    }));
}
