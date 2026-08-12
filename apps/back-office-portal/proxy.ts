import createMiddleware from "next-intl/middleware";
import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";

import { routing } from "./app/i18n/routing";
import type { AppRole } from "./src/features/auth/types/auth";

const handleI18nRouting = createMiddleware(routing);

type Locale = (typeof routing.locales)[number];

const AUTH_PATHS = ["/login"] as const;

const ROLE_GATED_PATHS: {
    prefix: string;
    allowedRoles: AppRole[];
}[] = [
    {
        prefix: "/team",
        allowedRoles: ["super_admin", "shop_admin"]
    },
    {
        prefix: "/settings/privacy-security",
        allowedRoles: ["super_admin", "shop_admin"]
    }
];

function matchesPath(pathname: string, path: string): boolean {
    return pathname === path || pathname.startsWith(`${path}/`);
}

function isMatchingPath(pathname: string, paths: readonly string[]): boolean {
    return paths.some((path) => matchesPath(pathname, path));
}

function getRoleGate(pathname: string) {
    return ROLE_GATED_PATHS.find(({ prefix }) => matchesPath(pathname, prefix));
}

function getPathnameLocale(pathname: string): Locale | null {
    const localeSegment = pathname.split("/")[1];
    const locale = routing.locales.find((supportedLocale) => supportedLocale === localeSegment);

    return locale ?? null;
}

function removeLocalePrefix(pathname: string, locale: Locale): string {
    const pathnameWithoutLocale = pathname.replace(new RegExp(`^/${locale}(?=/|$)`), "");

    return pathnameWithoutLocale || "/";
}

function getLocalizedPath(locale: Locale, pathname: string): string {
    return pathname === "/" ? `/${locale}` : `/${locale}${pathname}`;
}

function redirectTo(request: NextRequest, locale: Locale, pathname: string): NextResponse {
    const url = request.nextUrl.clone();

    url.pathname = getLocalizedPath(locale, pathname);
    url.search = "";

    return NextResponse.redirect(url);
}

function hasAllowedRole(role: AppRole | undefined, allowedRoles: AppRole[]): boolean {
    return Boolean(role && allowedRoles.includes(role));
}

/**
 * Reads the role out of core-api's access token without verifying the signature. That is
 * deliberate: this gate only decides which page to render, and every request the page then
 * makes is authorised by the API on its own. A forged token buys a redirect, not data.
 *
 * `typ` matters because AuthController and StorefrontAuthController both name their cookies
 * accessToken/refreshToken on the same API origin, so a customer session from the storefront
 * lands in this app's cookie jar too. Anything that isn't a staff token is treated as no session.
 */
function readStaffRole(accessToken: string | undefined): AppRole | undefined {
    if (!accessToken) return undefined;

    try {
        const payload = accessToken.split(".")[1];
        if (!payload) return undefined;

        const claims = JSON.parse(atob(payload.replace(/-/g, "+").replace(/_/g, "/"))) as {
            typ?: string;
            role?: string;
        };

        if (claims.typ !== "staff" || !claims.role) return undefined;

        return claims.role.toLowerCase() as AppRole;
    } catch {
        return undefined;
    }
}

export function proxy(request: NextRequest) {
    const { pathname, search } = request.nextUrl;
    const locale = getPathnameLocale(pathname);

    // Let next-intl detect and add the preferred locale before access checks.
    if (!locale) {
        return handleI18nRouting(request);
    }

    const appPathname = removeLocalePrefix(pathname, locale);

    /*
     * core-api sets httpOnly accessToken/refreshToken cookies. They are host-only (no
     * Domain attribute), and cookies ignore ports — so in dev, where both the API and this
     * app are on localhost, they reach this middleware. Once the API moves to its own
     * hostname they will not, and this gate silently stops seeing a session. At that point
     * either scope the cookies to a shared parent domain or move these checks client-side.
     */
    const userRole = readStaffRole(request.cookies.get("accessToken")?.value);
    // The access token lives 15 minutes; a stale one still means a signed-in user whose
    // next API call will refresh. Gating on the refresh token avoids bouncing them to
    // /login every quarter hour.
    const hasSession = Boolean(request.cookies.get("refreshToken")?.value);

    const isAuthPath = isMatchingPath(appPathname, AUTH_PATHS);

    if (appPathname === "/" && hasSession) {
        return redirectTo(request, locale, "/overview");
    }

    if (!hasSession && !isAuthPath) {
        const loginUrl = request.nextUrl.clone();

        loginUrl.pathname = getLocalizedPath(locale, "/login");
        loginUrl.search = "";
        loginUrl.searchParams.set("redirect", `${pathname}${search}`);

        return NextResponse.redirect(loginUrl);
    }

    if (hasSession && isAuthPath) {
        return redirectTo(request, locale, "/overview");
    }

    const roleGate = getRoleGate(appPathname);

    // Only deny when the role is actually known to be wrong. The access-token cookie
    // expires 15 minutes before the refresh token does, so a legitimate user routinely
    // arrives with a readable session but no readable role — denying then would lock
    // them out of /team until they signed in again. The API still enforces the real gate.
    if (roleGate && userRole && !hasAllowedRole(userRole, roleGate.allowedRoles)) {
        return redirectTo(request, locale, "/unauthorized");
    }

    return handleI18nRouting(request);
}

export const config = {
    matcher: ["/((?!api|trpc|_next/static|_next/image|favicon.ico|icon.svg|.*\\..*).*)"]
};
