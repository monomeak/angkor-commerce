/**
 * Builds a PATCH body from react-hook-form's dirtyFields, which is the only reliable signal
 * for "the user touched this". Comparing values against the original instead would send a
 * field the user typed into and then reverted, and would miss a field genuinely set back to
 * its default.
 *
 * Three cases, deliberately distinct:
 *
 *   unchanged           → key absent from the body entirely
 *   changed to a value  → key present with the new value
 *   explicitly cleared  → key present with `null`
 *
 * The last one is the reason this helper exists. `undefined` would vanish through
 * JSON.stringify and read on the server as "leave it alone", which is the opposite of what
 * the user asked for. An emptied text input therefore has to travel as an explicit null.
 *
 * NOTE: core-api's updateProduct currently ignores nulls (`if (request.x() != null)`), so
 * clearing a field is accepted but not yet applied server-side. The client contract is
 * correct here; the server needs a follow-up to honour it.
 */

/**
 * Mirrors react-hook-form's dirtyFields, which is only a boolean map for scalar fields —
 * arrays and nested objects come back as arrays/objects of booleans. Truthiness is the
 * usable signal across all of them, so the value type stays `unknown` rather than lying
 * about it being a boolean.
 */
export type DirtyMap<T> = Partial<Record<keyof T, unknown>>;

/** An emptied input arrives as one of these; all mean "clear it". */
function isCleared(value: unknown): boolean {
    return value === null || value === undefined || value === "";
}

export function buildPatchBody<T extends Record<string, unknown>>(
    values: T,
    dirtyFields: DirtyMap<T>,
    /** Fields the API cannot accept in a PATCH (e.g. variants, which have their own endpoints). */
    options: { omit?: ReadonlyArray<keyof T> } = {}
): Partial<Record<keyof T, unknown>> {
    const omit = new Set<keyof T>(options.omit ?? []);
    const body: Partial<Record<keyof T, unknown>> = {};

    for (const key of Object.keys(values) as Array<keyof T>) {
        if (omit.has(key)) continue;
        if (!dirtyFields[key]) continue;

        const value = values[key];
        body[key] = isCleared(value) ? null : value;
    }

    return body;
}

/** True when there is nothing to send, so the caller can skip the request entirely. */
export function isEmptyPatch(body: Record<string, unknown>): boolean {
    return Object.keys(body).length === 0;
}
