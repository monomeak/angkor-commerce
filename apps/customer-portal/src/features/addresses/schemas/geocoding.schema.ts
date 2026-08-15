import { z } from "zod";

/**
 * Nominatim's reverse response. Which keys are present depends entirely on what OSM knows
 * about the spot, so every one of them is optional and the mapper picks the first that
 * answers each of our fields.
 */
export const reverseGeocodeDtoSchema = z.object({
    display_name: z.string().optional(),
    address: z
        .object({
            house_number: z.string().optional(),
            road: z.string().optional(),
            neighbourhood: z.string().optional(),
            quarter: z.string().optional(),
            hamlet: z.string().optional(),
            village: z.string().optional(),
            suburb: z.string().optional(),
            city_district: z.string().optional(),
            district: z.string().optional(),
            county: z.string().optional(),
            municipality: z.string().optional(),
            town: z.string().optional(),
            city: z.string().optional(),
            province: z.string().optional(),
            state: z.string().optional(),
            region: z.string().optional(),
            postcode: z.string().optional(),
            country_code: z.string().optional()
        })
        .optional()
});

export type ReverseGeocodeDto = z.infer<typeof reverseGeocodeDtoSchema>;
