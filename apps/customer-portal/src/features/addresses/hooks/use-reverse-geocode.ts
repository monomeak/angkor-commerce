"use client";

import { useMutation } from "@tanstack/react-query";

import { reverseGeocode } from "../api/geocoding-api";
import type { Coordinates } from "../types/address";

/**
 * Imperative on purpose: the lookup belongs to the moment the customer moves the pin, not to
 * a render. Its `isPending`/`error` state is what the picker reports back to them.
 */
export function useReverseGeocode() {
    return useMutation({
        mutationFn: (coordinates: Coordinates) => reverseGeocode(coordinates)
    });
}
