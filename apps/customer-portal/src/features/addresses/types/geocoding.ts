/**
 * A reverse-geocoded pin, already shaped like the address form. Unknown parts come back as
 * empty strings rather than undefined, so filling the form is a straight assignment.
 */
export type GeocodedAddress = {
    /** The whole address on one line, as OSM writes it — what the picker shows back. */
    formatted: string;
    line1: string;
    commune: string;
    district: string;
    province: string;
    postalCode: string;
};
