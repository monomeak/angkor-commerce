import { z } from "zod";

/** Parses core-api's AuthenticatedCustomerResponse. Nullable strings are nullable in Java. */
export const authCustomerSchema = z.object({
    id: z.number(),
    displayName: z.string().nullable().default(null),
    firstName: z.string(),
    lastName: z.string(),
    companyName: z.string().nullable().default(null),
    email: z.string(),
    phone: z.string().nullable().default(null)
});

/** Parses core-api's CurrentCustomerResponse. */
export const currentCustomerSchema = authCustomerSchema.extend({
    image: z.string().nullable().default(null),
    status: z.string()
});
