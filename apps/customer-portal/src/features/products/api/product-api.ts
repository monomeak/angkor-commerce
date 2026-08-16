import { ApiError, apiFetch, parseResponse } from "@/lib/api-client";
import { mapProduct, mapProductList } from "../mappers/product.mapper";
import { productDtoSchema, productListDtoSchema } from "../schemas/product-api.schema";
import type { Product, ProductListParams, ProductListResult } from "../types/product";

/*
 * The only place the storefront catalogue talks HTTP. Components go through hooks (client)
 * or await this directly (server components); apiBaseUrl is passed in because it comes from
 * AppConfig, which a module cannot read on its own.
 *
 * GET /products is public, so none of this needs a session.
 */

const PRODUCTS_BASE = "/products";

export const DEFAULT_PRODUCT_LIMIT = 30;

/**
 * Empty and undefined values are dropped rather than sent blank: `?status=` fails enum
 * conversion with a 400 rather than being read as "no filter".
 */
function toSearchParams(params: ProductListParams): string {
    const search = new URLSearchParams();

    // A shopper must never see a product staff have taken off sale. The API's default only
    // excludes `deleted`, which is right for the back office and wrong here.
    search.set("status", "active");
    search.set("skip", String(params.skip ?? 0));
    search.set("limit", String(params.limit ?? DEFAULT_PRODUCT_LIMIT));

    if (params.q) search.set("q", params.q);
    if (params.categorySlug) search.set("categorySlug", params.categorySlug);
    if (params.minPrice !== undefined) search.set("minPrice", String(params.minPrice));
    if (params.maxPrice !== undefined) search.set("maxPrice", String(params.maxPrice));

    return search.toString();
}

export async function fetchProducts(apiBaseUrl: string, params: ProductListParams = {}): Promise<ProductListResult> {
    const data = await apiFetch<unknown>(apiBaseUrl, `${PRODUCTS_BASE}?${toSearchParams(params)}`);

    return mapProductList(parseResponse(productListDtoSchema, data));
}

/**
 * The full record — variants, images and the nested category the list row lacks.
 *
 * Returns null for a product that does not exist, so a route can render notFound() instead
 * of a 500. Anything else — an unreachable API, a schema mismatch — still throws, because
 * those are failures, not missing pages.
 *
 * GET /products/{id} is public but not status-filtered, so an inactive or archived product
 * is treated as absent rather than shown to a shopper.
 */
export async function findProduct(apiBaseUrl: string, id: number): Promise<Product | null> {
    try {
        const data = await apiFetch<unknown>(apiBaseUrl, `${PRODUCTS_BASE}/${id}`);
        const dto = parseResponse(productDtoSchema, data);

        return dto.status === "active" ? mapProduct(dto) : null;
    } catch (error) {
        if (error instanceof ApiError && error.status === 404) {
            return null;
        }
        throw error;
    }
}
