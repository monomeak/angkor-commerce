/**
 * core-api stores images as MinIO object keys. Storefront /me hands back the raw key,
 * so build the public URL here — while still passing through anything that already is
 * one, in case the API starts resolving keys itself (as the staff UserMapper does).
 *
 * `mediaBaseUrl` comes from useAppConfig() at the call site, same as apiBaseUrl.
 */
export function resolveMediaUrl(mediaBaseUrl: string, objectKey: string | null | undefined): string | undefined {
    if (!objectKey) {
        return undefined;
    }

    if (/^(https?:|data:|blob:|\/)/i.test(objectKey)) {
        return objectKey;
    }

    return `${mediaBaseUrl}/${objectKey}`;
}
