/**
 * Mirrors core-api's AddressResponse. Nullable columns come back as `null`, never as a
 * missing key, and `country` is a 2-letter ISO code the API defaults to "KH".
 *
 * Cambodian addressing, hence the shape: `line1` is house number + street, `commune` is
 * the sangkat/khum, `district` the khan/srok and `province` the capital/khaet.
 */
export type CustomerAddress = {
    id: number;
    label: string | null;
    recipientName: string;
    recipientPhone: string;
    line1: string;
    line2: string | null;
    commune: string | null;
    district: string;
    province: string;
    postalCode: string | null;
    country: string;
    /** Where the pin was dropped, or null on an address that was only typed. Always a pair. */
    latitude: number | null;
    longitude: number | null;
    isDefault: boolean;
};

/** A map pin. The API stores six decimal places, roughly 11 cm. */
export type Coordinates = {
    latitude: number;
    longitude: number;
};

/** Body of `POST /storefront/addresses` (core-api's CreateAddressRequest). */
export type CreateAddressPayload = {
    label?: string;
    recipientName: string;
    recipientPhone: string;
    line1: string;
    line2?: string;
    commune?: string;
    district: string;
    province: string;
    postalCode?: string;
    latitude?: number;
    longitude?: number;
    isDefault?: boolean;
};

/**
 * Body of `PATCH /storefront/addresses/{id}`. Omitted fields keep their stored value; a
 * blank string clears a nullable column. `isDefault` is not part of it — the default moves
 * through `PUT /{id}/default` so the API can keep exactly one per customer.
 */
export type UpdateAddressPayload = Partial<Omit<CreateAddressPayload, "isDefault">>;
