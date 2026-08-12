import { z } from "zod";

/** Mirrors core-api's CreateCategoryRequest constraints exactly. */
export const categoryFormSchema = z.object({
    name: z.string().trim().min(1, "Name is required").max(150, "Name must be at most 150 characters"),
    slug: z
        .string()
        .trim()
        .min(1, "Slug is required")
        .max(160, "Slug must be at most 160 characters")
        .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, "Lowercase letters, numbers and hyphens only"),
    /** Empty means top-level. */
    parentId: z.number().int().positive().nullable(),
    sortOrder: z.coerce.number().int().min(0, "Sort order cannot be negative")
});

export type CategoryFormValues = z.input<typeof categoryFormSchema>;

/**
 * The slug is derived from the name as the user types, until they edit it themselves —
 * typing a slug by hand is busywork, but it stays editable because it ends up in
 * storefront URLs and cannot be changed silently later.
 */
export function slugify(value: string): string {
    return (
        value
            .toLowerCase()
            .trim()
            .normalize("NFD")
            // Strip diacritics so "Vêtement" becomes "vetement" rather than losing the letter.
            .replace(/[̀-ͯ]/g, "")
            .replace(/[^a-z0-9]+/g, "-")
            .replace(/^-+|-+$/g, "")
    );
}
