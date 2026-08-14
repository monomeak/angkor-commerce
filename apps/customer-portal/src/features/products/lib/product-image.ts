import { resolveMediaUrl } from "@/lib/media";
import type { ProductImage } from "../types/product";

/*
 * Most of the catalogue has no photography yet, so the fallback is the common case rather
 * than an error case. It used to be one shared /image.png, which made a grid of unphotographed
 * products look like the same item repeated — so the placeholder is generated per product
 * instead: its initials over the shop wordmark, watermark style.
 *
 * Two properties this relies on:
 *
 * - It is derived only from the product name, so the server and the browser produce the same
 *   string. Anything random here would be a hydration mismatch.
 * - The SVG paints no background, so the themed container behind it (bg-gradient-to-br
 *   from-muted) shows through and the tile follows light/dark without this file knowing which.
 */

const WORDMARK = "ANGKOR COMMERCE";

/** Up to two initials, e.g. "Men's Canvas Low-Top Sneakers" → "MC". */
function initialsFrom(name: string): string {
    const letters = name
        .split(/\s+/)
        .map((word) => word.replace(/[^\p{L}\p{N}]/gu, "").charAt(0))
        .filter(Boolean)
        .slice(0, 2)
        .join("")
        .toUpperCase();

    return letters || "AC";
}

/**
 * A stable hue per product. Keeps saturation low so the tint reads as a shade of the page
 * rather than as colour, while still making neighbouring tiles in a grid tell apart.
 */
function hueFrom(name: string): number {
    let hash = 7;
    for (let index = 0; index < name.length; index += 1) {
        hash = (hash * 31 + name.charCodeAt(index)) % 360;
    }
    return hash;
}

/**
 * Colours use the legacy comma form and a separate opacity attribute rather than CSS Color 4
 * syntax: an SVG in an <img> is rendered standalone, so the safest subset wins. No `#` either,
 * which would terminate the data URI.
 */
function watermarkSvg(name: string): string {
    const initials = initialsFrom(name);
    const hue = hueFrom(name);
    const ink = `hsl(${hue}, 18%, 46%)`;

    return [
        '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 400 400">',
        `<g fill="none" stroke="${ink}" stroke-opacity="0.28">`,
        '<circle cx="200" cy="172" r="84" stroke-width="1.5"/>',
        '<circle cx="200" cy="172" r="96" stroke-width="1"/>',
        "</g>",
        `<text x="200" y="196" text-anchor="middle" fill="${ink}" fill-opacity="0.5"`,
        ' font-family="ui-sans-serif, system-ui, -apple-system, Segoe UI, Roboto, sans-serif"',
        ' font-size="72" font-weight="600" letter-spacing="4">',
        initials,
        "</text>",
        `<text x="200" y="306" text-anchor="middle" fill="${ink}" fill-opacity="0.42"`,
        ' font-family="ui-sans-serif, system-ui, -apple-system, Segoe UI, Roboto, sans-serif"',
        ' font-size="16" font-weight="500" letter-spacing="5">',
        WORDMARK,
        "</text>",
        "</svg>"
    ].join("");
}

/**
 * Watermark tile for a product with no image, as a data URI.
 *
 * Pass it to <Image unoptimized> — Next's optimiser does not handle data URIs.
 */
export function productPlaceholder(name: string): string {
    return `data:image/svg+xml,${encodeURIComponent(watermarkSvg(name))}`;
}

/** A product thumbnail (a raw MinIO object key), or its generated watermark when there is none. */
export function productImageSrc(
    mediaBaseUrl: string,
    objectKey: string | null | undefined,
    name: string
): string {
    return resolveMediaUrl(mediaBaseUrl, objectKey) ?? productPlaceholder(name);
}

/**
 * The gallery for the detail page: every uploaded image, or a single watermark frame so the
 * layout does not collapse on a product with no images.
 *
 * The product's own thumbnailUrl is not prepended — core-api sets it from the first uploaded
 * image, so it would duplicate images[0].
 */
export function productGallery(mediaBaseUrl: string, images: ProductImage[], name: string): string[] {
    if (images.length === 0) {
        return [productPlaceholder(name)];
    }

    return images.map((image) => productImageSrc(mediaBaseUrl, image.imageUrl, name));
}
