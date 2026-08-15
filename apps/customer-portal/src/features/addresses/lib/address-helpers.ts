import type { Coordinates, CustomerAddress } from "../types/address";

/** Mirrors `CustomerAddressServiceImpl.MAX_ADDRESSES` — the API rejects the fourth. */
export const MAX_SAVED_ADDRESSES = 3;

/** Where the map opens when there is no pin yet: central Phnom Penh. */
export const DEFAULT_MAP_CENTER: Coordinates = { latitude: 11.5564, longitude: 104.9282 };

/** The column is NUMERIC(9,6), so round on the way in and what is shown is what is stored. */
const COORDINATE_DECIMALS = 6;

export function roundCoordinates({ latitude, longitude }: Coordinates): Coordinates {
    return {
        latitude: Number(latitude.toFixed(COORDINATE_DECIMALS)),
        longitude: Number(longitude.toFixed(COORDINATE_DECIMALS))
    };
}

export function formatCoordinates({ latitude, longitude }: Coordinates): string {
    return `${latitude.toFixed(COORDINATE_DECIMALS)}, ${longitude.toFixed(COORDINATE_DECIMALS)}`;
}

/** The saved pin, if the address has one. The API only ever stores the pair. */
export function toCoordinates(address: CustomerAddress): Coordinates | null {
    return address.latitude !== null && address.longitude !== null
        ? { latitude: address.latitude, longitude: address.longitude }
        : null;
}

function joinParts(parts: readonly (string | null | undefined)[]): string {
    return parts.filter((part) => part && part.trim().length > 0).join(", ");
}

/** House number, street and building — "St. 271, Sky Tower 4F". */
export function formatStreetLine(address: CustomerAddress): string {
    return joinParts([address.line1, address.line2]);
}

/** Everything above the street — "Sangkat Toul Tumpung, Chamkarmon, Phnom Penh 12310". */
export function formatAreaLine(address: CustomerAddress): string {
    const region = joinParts([address.commune, address.district, address.province]);

    return address.postalCode ? `${region} ${address.postalCode}` : region;
}

/** What identifies an address in a list or a picker, when the customer gave it no label. */
export function formatAddressTitle(address: CustomerAddress): string {
    return address.label?.trim() || address.recipientName;
}
