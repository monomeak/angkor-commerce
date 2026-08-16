import { z } from "zod";
import { SKU_PATTERN } from "../lib/constants";

/**
 * Shared by create and edit, so the two forms cannot drift apart.
 *
 * Every rule here mirrors a constraint on core-api's CreateProductRequest /
 * CreateProductVariantRequest. Client validation is a convenience, not the authority — the
 * server re-checks everything and its field errors get mapped back onto the form.
 */

const optionalText = z
    .string()
    .trim()
    .transform((value) => (value === "" ? null : value))
    .nullable();

export const variantFormSchema = z.object({
    /**
     * Present on rows loaded from the API, absent on rows the user just added. The edit
     * flow uses this to decide between POST (new), PATCH (existing) and DELETE (removed).
     */
    id: z.number().optional(),
    size: optionalText,
    sku: z
        .string()
        .trim()
        .min(1, "SKU is required")
        .regex(SKU_PATTERN, "Use 3–100 characters: A–Z, 0–9 and hyphens only"),
    stock: z.coerce
        .number({ error: "Stock is required" })
        .int("Stock must be a whole number")
        .min(0, "Stock cannot be negative"),
    /** null means "inherit the product price" — an empty input, not zero. */
    priceOverride: z
        .union([z.literal(""), z.coerce.number().positive("Price override must be greater than 0")])
        .transform((value) => (value === "" ? null : value))
        .nullable()
});

export const productFormSchema = z.object({
    name: z.string().trim().min(1, "Name is required").max(200, "Name must be at most 200 characters"),
    description: optionalText,
    categoryId: z.coerce.number({ error: "Category is required" }).int().positive("Category is required"),
    price: z.coerce.number({ error: "Price is required" }).positive("Price must be greater than 0"),
    // core-api validates this as ^[A-Z]{3}$.
    currency: z
        .string()
        .trim()
        .regex(/^[A-Z]{3}$/, "Use a 3-letter ISO code, e.g. USD"),
    discountPercentage: z.coerce
        .number({ error: "Discount is required" })
        .min(0, "Discount cannot be negative")
        .max(100, "Discount cannot exceed 100"),
    unit: optionalText,
    thumbnailUrl: optionalText,
    status: z.enum(["active", "inactive"]),
    /**
     * core-api's @NotEmpty on CreateProductRequest.variants: a product carries no stock or
     * SKU of its own, so one with no variants could never be sold.
     */
    variants: z.array(variantFormSchema).min(1, "Add at least one variant"),
    /** Not persisted on create — see the images note in the product form. */
    images: z.array(z.string()).default([])
});

export type ProductFormValues = z.input<typeof productFormSchema>;
export type ValidatedProductForm = z.output<typeof productFormSchema>;
export type VariantFormValues = z.input<typeof variantFormSchema>;
