"use client";

import { useState, type ReactNode } from "react";
import dynamic from "next/dynamic";
import { Crosshair } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";
import { DEFAULT_MAP_CENTER, formatCoordinates, roundCoordinates } from "../lib/address-helpers";
import type { Coordinates } from "../types/address";

/**
 * Leaflet reads `window` on import, so the map can only ever be created in the browser. It
 * is also ~150 kB that a form without a map should not pay for.
 */
const MapCanvas = dynamic(() => import("./map-canvas"), {
    ssr: false,
    loading: () => <Skeleton className="size-full rounded-none" />
});

type MapPickerProps = {
    readonly value: Coordinates | null;
    readonly onChange: (coordinates: Coordinates) => void;
    /** Where to open when nothing is picked yet. Defaults to central Phnom Penh. */
    readonly center?: Coordinates;
    /** Rendered under the map — what the pin resolved to, or why it didn't. */
    readonly children?: ReactNode;
    readonly className?: string;
};

/**
 * Reusable location picker: tap the map to drop a pin, drag it to correct it. It only ever
 * reports coordinates — naming the spot is the caller's business.
 */
export function MapPicker({ value, onChange, center = DEFAULT_MAP_CENTER, children, className }: MapPickerProps) {
    const [isLocating, setIsLocating] = useState(false);
    const [locateError, setLocateError] = useState<string | null>(null);

    function useMyLocation() {
        if (!navigator.geolocation) {
            setLocateError("This browser can't share your location.");
            return;
        }

        setLocateError(null);
        setIsLocating(true);
        navigator.geolocation.getCurrentPosition(
            (position) => {
                setIsLocating(false);
                onChange(
                    roundCoordinates({
                        latitude: position.coords.latitude,
                        longitude: position.coords.longitude
                    })
                );
            },
            () => {
                setIsLocating(false);
                setLocateError("Couldn't get your location. Drop the pin by hand instead.");
            },
            { enableHighAccuracy: true, timeout: 10_000 }
        );
    }

    return (
        <div className={cn("flex flex-col gap-2", className)}>
            <div className="h-56 w-full overflow-hidden rounded-xl border sm:h-72">
                <MapCanvas value={value} center={center} onChange={onChange} />
            </div>

            <div className="flex flex-wrap items-center justify-between gap-x-4 gap-y-1">
                <p className="text-xs text-muted-foreground">
                    {value
                        ? `Pin at ${formatCoordinates(value)}`
                        : "Tap the map to drop a pin, then drag it to fine-tune."}
                </p>
                <Button type="button" variant="ghost" size="sm" disabled={isLocating} onClick={useMyLocation}>
                    <Crosshair data-icon="inline-start" className="size-4" />
                    {isLocating ? "Locating…" : "Use my location"}
                </Button>
            </div>

            {locateError && <p className="text-xs text-destructive">{locateError}</p>}
            {children}
        </div>
    );
}
