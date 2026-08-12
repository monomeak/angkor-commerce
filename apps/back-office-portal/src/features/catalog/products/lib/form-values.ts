import type { CreateProductPayload } from "../api/product-api";
import type { ProductFormValues } from "../schemas/product-form.schema";
import type { VariantRowInput } from "./reconcile-variants";
import type { Product } from "../types/product";

/** A blank product: one empty variant row, since a product needs at least one. */
export function emptyProductFormValues(defaultCurrency: string): ProductFormValues {
    return {
        name: "",
        description: null,
        categoryId: undefined as unknown as number,
        price: undefined as unknown as number,
        currency: defaultCurrency,
        discountPercentage: 0,
        unit: null,
        thumbnailUrl: null,
        status: "active",
        variants: [{ size: null, sku: "", stock: 0, priceOverride: null }],
        images: []
    };
}

/**
 * Seeds the edit form from the server record.
 *
 * `status` is narrowed to active/inactive: an archived product is edited through the same
 * form, but "archived" is not something the status dropdown can set — restoring happens via
 * the dedicated action, so an archived product shows as inactive here until saved.
 */
export function toProductFormValues(product: Product): ProductFormValues {
    return {
        name: product.name,
        description: product.description,
        categoryId: product.category?.id as number,
        price: product.price,
        currency: product.currency,
        discountPercentage: product.discountPercentage,
        unit: product.unit,
        thumbnailUrl: product.thumbnailUrl,
        status: product.status === "active" ? "active" : "inactive",
        variants: product.variants.map((variant) => ({
            id: variant.id,
            size: variant.size,
            sku: variant.sku,
            stock: variant.stock,
            priceOverride: variant.priceOverride
        })),
        images: product.images.map((image) => image.imageUrl)
    };
}

/** Form → POST body. Variants go nested; this is the only endpoint that accepts them that way. */
export function toCreatePayload(values: ProductFormValues): CreateProductPayload {
    return {
        name: String(values.name).trim(),
        description: values.description ?? null,
        categoryId: Number(values.categoryId),
        price: Number(values.price),
        currency: String(values.currency).trim().toUpperCase(),
        discountPercentage: Number(values.discountPercentage ?? 0),
        unit: values.unit ?? null,
        thumbnailUrl: values.thumbnailUrl ?? null,
        variants: (values.variants ?? []).map((variant) => ({
            size: variant.size ?? null,
            sku: String(variant.sku).trim(),
            stock: Number(variant.stock),
            priceOverride:
                variant.priceOverride === null || variant.priceOverride === undefined || variant.priceOverride === ""
                    ? null
                    : Number(variant.priceOverride)
        }))
    };
}

/** Form rows → reconciliation input, preserving the id that marks a row as pre-existing. */
export function toVariantRows(values: ProductFormValues): VariantRowInput[] {
    return (values.variants ?? []).map((variant) => ({
        id: variant.id,
        size: variant.size ?? null,
        sku: String(variant.sku).trim(),
        stock: Number(variant.stock),
        priceOverride:
            variant.priceOverride === null || variant.priceOverride === undefined || variant.priceOverride === ""
                ? null
                : Number(variant.priceOverride)
    }));
}
