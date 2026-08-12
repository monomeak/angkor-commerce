import { apiFetch, parseResponse } from "@/lib/api-client";
import {
    productDeleteDtoSchema,
    productDtoSchema,
    productImageDtoSchema,
    productListDtoSchema,
    productVariantDtoSchema
} from "../schemas/product-api.schema";
import { mapArchivedProduct, mapProduct, mapProductList, mapProductVariant } from "../mappers/product.mapper";
import type {
    ArchivedProduct,
    Product,
    ProductImage,
    ProductListParams,
    ProductListResult,
    ProductVariant
} from "../types/product";

/*
 * The only place the catalogue talks HTTP. Components go through hooks, hooks call these.
 * apiBaseUrl is passed in because it comes from <AppConfigProvider> via useAppConfig(),
 * which can only be read inside a hook or component.
 */

const PRODUCTS_BASE = "/products";

/**
 * There is no /products/search endpoint despite what a DummyJSON-shaped API suggests — `q`
 * is a filter on the list endpoint, matching name, description and variant SKU.
 *
 * Empty and undefined values are dropped rather than sent blank: `?status=` fails enum
 * conversion with a 400 rather than being treated as "no filter".
 */
function toSearchParams(params: ProductListParams): string {
    const search = new URLSearchParams();

    search.set("skip", String(params.skip));
    search.set("limit", String(params.limit));

    if (params.q) search.set("q", params.q);
    if (params.categorySlug) search.set("categorySlug", params.categorySlug);
    if (params.categoryId !== undefined) search.set("categoryId", String(params.categoryId));
    if (params.status) search.set("status", params.status);
    if (params.sortBy) search.set("sortBy", params.sortBy);
    if (params.order) search.set("order", params.order);

    return search.toString();
}

export async function fetchProducts(apiBaseUrl: string, params: ProductListParams): Promise<ProductListResult> {
    const data = await apiFetch<unknown>(apiBaseUrl, `${PRODUCTS_BASE}?${toSearchParams(params)}`);

    return mapProductList(parseResponse(productListDtoSchema, data));
}

export async function fetchProduct(apiBaseUrl: string, id: number): Promise<Product> {
    const data = await apiFetch<unknown>(apiBaseUrl, `${PRODUCTS_BASE}/${id}`);

    return mapProduct(parseResponse(productDtoSchema, data));
}

export interface CreateProductPayload {
    name: string;
    description: string | null;
    categoryId: number;
    price: number;
    currency: string;
    discountPercentage: number;
    unit: string | null;
    thumbnailUrl: string | null;
    variants: Array<{
        size: string | null;
        sku: string;
        stock: number;
        priceOverride: number | null;
    }>;
}

/**
 * Variants are created inline with the product — this is the one place the API accepts them
 * nested. Every later change to a variant goes through the sub-resource endpoints below.
 */
export async function createProduct(apiBaseUrl: string, payload: CreateProductPayload): Promise<Product> {
    const data = await apiFetch<unknown>(apiBaseUrl, PRODUCTS_BASE, {
        method: "POST",
        body: JSON.stringify(payload)
    });

    return mapProduct(parseResponse(productDtoSchema, data));
}

/** Partial update. The body is built by buildPatchBody() so only touched fields travel. */
export async function updateProduct(apiBaseUrl: string, id: number, body: Record<string, unknown>): Promise<Product> {
    const data = await apiFetch<unknown>(apiBaseUrl, `${PRODUCTS_BASE}/${id}`, {
        method: "PATCH",
        body: JSON.stringify(body)
    });

    return mapProduct(parseResponse(productDtoSchema, data));
}

/**
 * Soft delete: the row stays, its status flips to "deleted". Restoring one is a PATCH back
 * to active, which is why the API had to keep archived products writable.
 */
export async function archiveProduct(apiBaseUrl: string, id: number): Promise<ArchivedProduct> {
    const data = await apiFetch<unknown>(apiBaseUrl, `${PRODUCTS_BASE}/${id}`, { method: "DELETE" });

    return mapArchivedProduct(parseResponse(productDeleteDtoSchema, data));
}

export async function restoreProduct(apiBaseUrl: string, id: number): Promise<Product> {
    return updateProduct(apiBaseUrl, id, { status: "active" });
}

// ── Variants ──────────────────────────────────────────────
// Separate endpoints, so editing a product's variants means reconciling rows against the
// server list: added rows POST, changed rows PATCH, removed rows DELETE.

export interface VariantPayload {
    size: string | null;
    sku: string;
    stock: number;
    priceOverride: number | null;
}

export async function addVariant(
    apiBaseUrl: string,
    productId: number,
    payload: VariantPayload
): Promise<ProductVariant> {
    const data = await apiFetch<unknown>(apiBaseUrl, `${PRODUCTS_BASE}/${productId}/variants`, {
        method: "POST",
        body: JSON.stringify(payload)
    });

    return mapProductVariant(parseResponse(productVariantDtoSchema, data));
}

export async function updateVariant(
    apiBaseUrl: string,
    productId: number,
    variantId: number,
    payload: VariantPayload
): Promise<ProductVariant> {
    const data = await apiFetch<unknown>(apiBaseUrl, `${PRODUCTS_BASE}/${productId}/variants/${variantId}`, {
        method: "PATCH",
        body: JSON.stringify(payload)
    });

    return mapProductVariant(parseResponse(productVariantDtoSchema, data));
}

export async function deleteVariant(apiBaseUrl: string, productId: number, variantId: number): Promise<void> {
    await apiFetch<void>(apiBaseUrl, `${PRODUCTS_BASE}/${productId}/variants/${variantId}`, { method: "DELETE" });
}

// ── Images ────────────────────────────────────────────────
// Upload is multipart, not JSON — the API stores the file in MinIO, validates it by magic
// bytes rather than by extension, and generates the thumbnail itself. apiFetch leaves the
// Content-Type unset for FormData so the browser can add the multipart boundary.

export async function uploadProductImage(
    apiBaseUrl: string,
    productId: number,
    file: File,
    displayOrder?: number
): Promise<ProductImage> {
    const body = new FormData();
    body.append("file", file);

    const query = displayOrder === undefined ? "" : `?displayOrder=${displayOrder}`;
    const data = await apiFetch<unknown>(apiBaseUrl, `${PRODUCTS_BASE}/${productId}/images${query}`, {
        method: "POST",
        body
    });

    return parseResponse(productImageDtoSchema, data);
}

export async function deleteProductImage(apiBaseUrl: string, productId: number, imageId: number): Promise<void> {
    await apiFetch<void>(apiBaseUrl, `${PRODUCTS_BASE}/${productId}/images/${imageId}`, { method: "DELETE" });
}
