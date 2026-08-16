import type { VariantPayload } from "../api/product-api";
import type { ProductVariant } from "../types/product";

/**
 * The create endpoint takes variants nested in the request body, but there is no equivalent
 * for update — PATCH /products/{id} has no variants field at all. Editing them means
 * diffing the form rows against what the server currently has and issuing one call per
 * change against /products/{id}/variants.
 *
 * Rows carry an `id` when they came from the API and none when the user just added them,
 * which is what separates a create from an update. Anything the server has that the form no
 * longer lists was removed.
 */

export interface VariantRowInput {
    id?: number;
    size: string | null;
    sku: string;
    stock: number;
    priceOverride: number | null;
}

export interface VariantReconciliation {
    created: VariantPayload[];
    updated: Array<{ id: number; payload: VariantPayload }>;
    deletedIds: number[];
}

function toPayload(row: VariantRowInput): VariantPayload {
    return {
        size: row.size,
        sku: row.sku,
        stock: row.stock,
        priceOverride: row.priceOverride
    };
}

function hasChanged(row: VariantRowInput, existing: ProductVariant): boolean {
    return (
        row.sku !== existing.sku ||
        row.stock !== existing.stock ||
        (row.size ?? null) !== (existing.size ?? null) ||
        (row.priceOverride ?? null) !== (existing.priceOverride ?? null)
    );
}

export function reconcileVariants(rows: VariantRowInput[], existing: ProductVariant[]): VariantReconciliation {
    const existingById = new Map(existing.map((variant) => [variant.id, variant]));
    const keptIds = new Set<number>();

    const created: VariantPayload[] = [];
    const updated: Array<{ id: number; payload: VariantPayload }> = [];

    for (const row of rows) {
        // An id the server doesn't know about (stale form, deleted elsewhere) is treated as
        // a new row rather than a PATCH that would 404.
        const current = row.id === undefined ? undefined : existingById.get(row.id);

        if (!current) {
            created.push(toPayload(row));
            continue;
        }

        keptIds.add(current.id);

        // Skip untouched rows so an edit that only changed the name doesn't rewrite every variant.
        if (hasChanged(row, current)) {
            updated.push({ id: current.id, payload: toPayload(row) });
        }
    }

    const deletedIds = existing.filter((variant) => !keptIds.has(variant.id)).map((variant) => variant.id);

    return { created, updated, deletedIds };
}

export function isEmptyReconciliation(result: VariantReconciliation): boolean {
    return result.created.length === 0 && result.updated.length === 0 && result.deletedIds.length === 0;
}
