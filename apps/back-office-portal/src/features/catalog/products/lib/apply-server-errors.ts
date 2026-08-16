import type { FieldValues, Path, UseFormSetError } from "react-hook-form";
import { ApiError } from "@/lib/api-client";

/**
 * core-api returns bean-validation failures as { errors: { fieldName: message } }. Those
 * belong on the offending input, not in a toast the user has to map back to a field
 * themselves. Anything without a field (a 409, a business rule) is returned for the caller
 * to toast instead.
 *
 * Returns the message to toast, or null when every error found a home on a field.
 */
export function applyServerErrors<T extends FieldValues>(
    error: unknown,
    setError: UseFormSetError<T>,
    /** Maps an API field name to a form field path when they differ. */
    fieldMap: Partial<Record<string, Path<T>>> = {}
): string | null {
    if (!(error instanceof ApiError)) {
        return error instanceof Error ? error.message : "Something went wrong. Please try again.";
    }

    const fieldErrors = error.fieldErrors;
    if (!fieldErrors || Object.keys(fieldErrors).length === 0) {
        return error.message;
    }

    let unmatched: string | null = null;

    for (const [apiField, message] of Object.entries(fieldErrors)) {
        const path = fieldMap[apiField] ?? (apiField as Path<T>);

        if (path) {
            setError(path, { type: "server", message });
        } else {
            unmatched = message;
        }
    }

    return unmatched;
}
