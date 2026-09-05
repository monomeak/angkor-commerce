import { z } from "zod";

/**
 * Wire shapes for `/customers`, exactly as core-api serialises them. `status` is lowercase
 * because RecordStatus carries @JsonValue; `image` is a raw object key, and every name field
 * but the email is nullable in the table.
 */
export const customerStatusSchema = z.enum(["active", "inactive", "deleted"]);

export const customerDtoSchema = z.object({
    id: z.number(),
    displayName: z.string().nullable(),
    firstName: z.string().nullable(),
    lastName: z.string().nullable(),
    companyName: z.string().nullable(),
    email: z.string(),
    phone: z.string().nullable(),
    image: z.string().nullable(),
    taxNumber: z.string().nullable(),
    status: customerStatusSchema,
    createdAt: z.string(),
    updatedAt: z.string()
});

/** PageResponse<T> names the rows after the resource. */
export const customerListDtoSchema = z.object({
    customers: z.array(customerDtoSchema),
    total: z.number(),
    skip: z.number(),
    limit: z.number()
});

export type CustomerDto = z.infer<typeof customerDtoSchema>;
export type CustomerListDto = z.infer<typeof customerListDtoSchema>;
