import { z } from "zod";

/**
 * Parses core-api's AddressResponse. `createdAt`/`updatedAt` come back too but nothing in
 * the storefront uses them.
 */
export const addressDtoSchema = z.object({
    id: z.number(),
    label: z.string().nullable(),
    recipientName: z.string(),
    recipientPhone: z.string(),
    line1: z.string(),
    line2: z.string().nullable(),
    commune: z.string().nullable(),
    district: z.string(),
    province: z.string(),
    postalCode: z.string().nullable(),
    country: z.string(),
    // NUMERIC(9,6) on the API side, which Jackson writes as a plain JSON number.
    latitude: z.number().nullable(),
    longitude: z.number().nullable(),
    isDefault: z.boolean()
});

/** `GET /storefront/addresses` returns a bare array — no paginated envelope. */
export const addressListDtoSchema = z.array(addressDtoSchema);
