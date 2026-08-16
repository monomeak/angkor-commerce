import { z } from "zod";

/**
 * GET /categories returns a bare array, not a paginated envelope — unlike products.
 * createdAt/updatedAt come back too but nothing in the storefront uses them.
 */
export const categoryDtoSchema = z.object({
    id: z.number(),
    parentId: z.number().nullable(),
    name: z.string(),
    slug: z.string(),
    sortOrder: z.number().nullable()
});

export const categoryListDtoSchema = z.array(categoryDtoSchema);

export type CategoryDto = z.infer<typeof categoryDtoSchema>;
