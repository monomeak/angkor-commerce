import { z } from "zod";

/** Optional columns: blank is allowed and means "not set". */
const optionalText = (max: number, tooLong: string) => z.string().trim().max(max, tooLong);

/**
 * Mirrors the bean validation on core-api's CreateAddressRequest so a typo fails in the form
 * rather than on a round trip. The phone pattern is the API's (`^\+?[0-9]{8,15}$`), which has
 * no room for the spaces people naturally type — so they are stripped before it is checked.
 */
export const addressFormSchema = z.object({
    label: optionalText(50, "Label is too long."),
    recipientName: z.string().trim().min(1, "Recipient name is required.").max(150, "Recipient name is too long."),
    recipientPhone: z
        .string()
        .trim()
        .transform((value) => value.replace(/[\s-]/g, ""))
        .refine((value) => /^\+?[0-9]{8,15}$/.test(value), "Enter a valid phone number, e.g. 012 345 678."),
    line1: z.string().trim().min(1, "House number and street are required.").max(255, "Address line is too long."),
    line2: optionalText(255, "Address line is too long."),
    commune: optionalText(100, "Commune is too long."),
    district: z.string().trim().min(1, "District is required.").max(100, "District is too long."),
    province: z.string().trim().min(1, "Province is required.").max(100, "Province is too long."),
    postalCode: optionalText(20, "Postal code is too long.")
});

/** What the inputs hold: every field is a string, optional ones simply blank. */
export type AddressFormFields = z.input<typeof addressFormSchema>;

/** What the API is sent: trimmed, with the phone stripped of spaces. */
export type AddressFormValues = z.output<typeof addressFormSchema>;
