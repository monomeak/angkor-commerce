import { apiFetch, parseResponse } from "@/lib/api-client";
import { categoryDtoSchema, categoryListDtoSchema } from "../schemas/category.schema";
import type { Category } from "../types/category";

const CATEGORIES_BASE = "/categories";

function toCategory(dto: {
    id: number;
    name: string;
    slug: string;
    parentId: number | null;
    sortOrder: number | null;
}): Category {
    return {
        id: dto.id,
        name: dto.name,
        slug: dto.slug,
        parentId: dto.parentId,
        sortOrder: dto.sortOrder ?? 0
    };
}

/** Returns a bare array — no pagination envelope, unlike products. */
export async function fetchCategories(apiBaseUrl: string): Promise<Category[]> {
    const data = await apiFetch<unknown>(apiBaseUrl, CATEGORIES_BASE);

    return parseResponse(categoryListDtoSchema, data).map(toCategory);
}

export interface CreateCategoryPayload {
    name: string;
    slug: string;
    parentId: number | null;
    sortOrder: number;
}

export async function createCategory(apiBaseUrl: string, payload: CreateCategoryPayload): Promise<Category> {
    const data = await apiFetch<unknown>(apiBaseUrl, CATEGORIES_BASE, {
        method: "POST",
        body: JSON.stringify(payload)
    });

    return toCategory(parseResponse(categoryDtoSchema, data));
}

/** core-api exposes a full replace (PUT) here, not a PATCH — every field must be sent. */
export async function updateCategory(
    apiBaseUrl: string,
    id: number,
    payload: CreateCategoryPayload
): Promise<Category> {
    const data = await apiFetch<unknown>(apiBaseUrl, `${CATEGORIES_BASE}/${id}`, {
        method: "PUT",
        body: JSON.stringify(payload)
    });

    return toCategory(parseResponse(categoryDtoSchema, data));
}

export async function deleteCategory(apiBaseUrl: string, id: number): Promise<void> {
    await apiFetch<void>(apiBaseUrl, `${CATEGORIES_BASE}/${id}`, { method: "DELETE" });
}
