"use client";

import { useEffect, useMemo, useRef, type RefObject } from "react";
import { divIcon, type Marker as LeafletMarker } from "leaflet";
import { MapContainer, Marker, TileLayer, useMap, useMapEvents } from "react-leaflet";

import { roundCoordinates } from "../lib/address-helpers";
import type { Coordinates } from "../types/address";

import "leaflet/dist/leaflet.css";

type MapCanvasProps = {
    readonly value: Coordinates | null;
    /** Where to open when there is no pin yet. */
    readonly center: Coordinates;
    readonly onChange: (coordinates: Coordinates) => void;
};

const PIN_ZOOM = 17;
const AREA_ZOOM = 13;

/** OSM's own raster tiles: no key, no account, and the attribution their policy asks for. */
const TILE_URL = "https://tile.openstreetmap.org/{z}/{x}/{y}.png";
const TILE_ATTRIBUTION = '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors';

function isSameSpot(one: Coordinates | null, other: Coordinates | null): boolean {
    return one !== null && other !== null && one.latitude === other.latitude && one.longitude === other.longitude;
}

/**
 * Leaflet's default marker is a PNG it resolves against the page URL, which no bundler gets
 * right. Drawing the pin in HTML sidesteps the asset entirely and lets it take the theme's
 * colors. A centred dot rather than a teardrop, so what is selected is exactly what is under
 * the marker.
 */
function usePinIcon() {
    return useMemo(
        () =>
            divIcon({
                className: "",
                html: '<span class="block size-4 rounded-full border-2 border-background bg-primary shadow-md"></span>',
                iconSize: [16, 16],
                iconAnchor: [8, 8]
            }),
        []
    );
}

/** Turns a click anywhere on the map into a pin drop. */
function ClickHandler({ onChange }: { readonly onChange: (coordinates: Coordinates) => void }) {
    useMapEvents({
        click: (event) => onChange({ latitude: event.latlng.lat, longitude: event.latlng.lng })
    });

    return null;
}

/**
 * Follows the pin when it is moved from outside the map — a saved address being picked, say.
 * Moves the map made here are skipped: the pin is already in view, and re-centring on a drop
 * would yank the map out from under the cursor.
 */
function FollowExternalMoves({
    value,
    pickedHere
}: {
    readonly value: Coordinates | null;
    /** The last spot this map emitted, read in the effect so render never touches a ref. */
    readonly pickedHere: RefObject<Coordinates | null>;
}) {
    const map = useMap();

    useEffect(() => {
        if (value && !isSameSpot(value, pickedHere.current)) {
            map.setView([value.latitude, value.longitude], Math.max(map.getZoom(), PIN_ZOOM));
        }
    }, [map, value, pickedHere]);

    return null;
}

export default function MapCanvas({ value, center, onChange }: MapCanvasProps) {
    const markerRef = useRef<LeafletMarker | null>(null);
    const lastPickedRef = useRef<Coordinates | null>(null);
    const icon = usePinIcon();
    const start = value ?? center;

    function handlePick(coordinates: Coordinates) {
        // Rounded here, not in the parent, so the value that comes back matches what this
        // map last emitted and FollowExternalMoves stays quiet.
        const picked = roundCoordinates(coordinates);

        lastPickedRef.current = picked;
        onChange(picked);
    }

    return (
        <MapContainer
            center={[start.latitude, start.longitude]}
            zoom={value ? PIN_ZOOM : AREA_ZOOM}
            scrollWheelZoom={false}
            className="size-full"
        >
            <TileLayer url={TILE_URL} attribution={TILE_ATTRIBUTION} />
            <ClickHandler onChange={handlePick} />
            <FollowExternalMoves value={value} pickedHere={lastPickedRef} />

            {value && (
                <Marker
                    position={[value.latitude, value.longitude]}
                    icon={icon}
                    draggable
                    ref={markerRef}
                    eventHandlers={{
                        dragend: () => {
                            const dropped = markerRef.current?.getLatLng();

                            if (dropped) {
                                handlePick({ latitude: dropped.lat, longitude: dropped.lng });
                            }
                        }
                    }}
                />
            )}
        </MapContainer>
    );
}
