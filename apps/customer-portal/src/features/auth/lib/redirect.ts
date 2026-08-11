const DEFAULT_REDIRECT = "/";

/**
 * Only ever follow same-origin paths — a `?next=` value is attacker-controllable and
 * `//evil.example` would otherwise be a protocol-relative jump off the site.
 */
export function safeRedirectPath(next: string | undefined): string {
    if (!next || !next.startsWith("/") || next.startsWith("//")) {
        return DEFAULT_REDIRECT;
    }

    return next;
}
