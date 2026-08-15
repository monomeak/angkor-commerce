import { reverseGeocodeDtoSchema, type ReverseGeocodeDto } from "../schemas/geocoding.schema";
import type { Coordinates } from "../types/address";
import type { GeocodedAddress } from "../types/geocoding";

/**
 * OpenStreetMap's geocoder: no key, no account, and the same data behind the map tiles, so a
 * pin and its address agree. This is the one call in the portal that does not go through
 * `apiFetch` — that helper is for core-api, and sending session cookies to a third party
 * would be wrong.
 *
 * Nominatim's usage policy allows about one request a second, which is what a person
 * dropping a pin does anyway; nothing here should ever call it in a loop.
 */
const NOMINATIM_REVERSE_URL = "https://nominatim.openstreetmap.org/reverse";

/** Street level. Zooming out further returns a neighbourhood instead of a house. */
const STREET_ZOOM = "18";

/** First non-empty candidate, since which keys OSM fills in varies by place. */
function pick(...candidates: (string | undefined)[]): string {
    return candidates.find((candidate) => candidate && candidate.trim().length > 0)?.trim() ?? "";
}

function toGeocodedAddress(dto: ReverseGeocodeDto): GeocodedAddress {
    const parts = dto.address ?? {};
    const street = pick([parts.house_number, parts.road].filter(Boolean).join(" "));

    return {
        formatted: dto.display_name ?? "",
        // A spot with no named road still has a display name to fall back on ("Sky Tower, …").
        line1: street || pick(dto.display_name?.split(",")[0]),
        commune: pick(parts.suburb, parts.quarter, parts.neighbourhood, parts.village, parts.hamlet),
        district: pick(parts.city_district, parts.district, parts.town, parts.municipality, parts.county),
        province: pick(parts.state, parts.province, parts.city, parts.region),
        postalCode: pick(parts.postcode)
    };
}

export async function reverseGeocode(coordinates: Coordinates, signal?: AbortSignal): Promise<GeocodedAddress> {
    const query = new URLSearchParams({
        lat: String(coordinates.latitude),
        lon: String(coordinates.longitude),
        format: "jsonv2",
        addressdetails: "1",
        zoom: STREET_ZOOM
    });

    const response = await fetch(`${NOMINATIM_REVERSE_URL}?${query.toString()}`, {
        signal,
        headers: { Accept: "application/json" }
    });

    if (!response.ok) {
        throw new Error("The address lookup is unavailable right now.");
    }

    const parsed = reverseGeocodeDtoSchema.safeParse(await response.json());

    if (!parsed.success || (!parsed.data.address && !parsed.data.display_name)) {
        // Open water, unmapped land, or an error payload — the pin is still valid, the name isn't.
        throw new Error("No address found at that spot.");
    }

    return toGeocodedAddress(parsed.data);
}
