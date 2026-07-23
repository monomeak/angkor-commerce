import createMiddleware from "next-intl/middleware";
import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";

import { routing } from "./app/i18n/routing";
import type { AppRole } from "./src/features/auth/types/auth";

const handleI18nRouting = createMiddleware(routing);

type Locale = (typeof routing.locales)[number];

const AUTH_PATHS = ["/login", "/register", "/forget-password"] as const;
const PUBLIC_PATHS = ["/"] as const;

const ROLE_GATED_PATHS: {
  prefix: string;
  allowedRoles: AppRole[];
}[] = [
  {
    prefix: "/team",
    allowedRoles: ["super_admin", "shop_admin"],
  },
  {
    prefix: "/settings/privacy-security",
    allowedRoles: ["super_admin", "shop_admin"],
  },
];

function matchesPath(pathname: string, path: string): boolean {
  return pathname === path || pathname.startsWith(`${path}/`);
}

function isMatchingPath(
  pathname: string,
  paths: readonly string[],
): boolean {
  return paths.some((path) => matchesPath(pathname, path));
}

function getRoleGate(pathname: string) {
  return ROLE_GATED_PATHS.find(({ prefix }) =>
    matchesPath(pathname, prefix),
  );
}

function getPathnameLocale(pathname: string): Locale | null {
  const localeSegment = pathname.split("/")[1];
  const locale = routing.locales.find(
    (supportedLocale) => supportedLocale === localeSegment,
  );

  return locale ?? null;
}

function removeLocalePrefix(pathname: string, locale: Locale): string {
  const pathnameWithoutLocale = pathname.replace(
    new RegExp(`^/${locale}(?=/|$)`),
    "",
  );

  return pathnameWithoutLocale || "/";
}

function getLocalizedPath(locale: Locale, pathname: string): string {
  return pathname === "/" ? `/${locale}` : `/${locale}${pathname}`;
}

function redirectTo(
  request: NextRequest,
  locale: Locale,
  pathname: string,
): NextResponse {
  const url = request.nextUrl.clone();

  url.pathname = getLocalizedPath(locale, pathname);
  url.search = "";

  return NextResponse.redirect(url);
}

function hasAllowedRole(
  role: AppRole | undefined,
  allowedRoles: AppRole[],
): boolean {
  return Boolean(role && allowedRoles.includes(role));
}

export function proxy(request: NextRequest) {
  const { pathname, search } = request.nextUrl;
  const locale = getPathnameLocale(pathname);

  // Let next-intl detect and add the preferred locale before access checks.
  if (!locale) {
    return handleI18nRouting(request);
  }

  const appPathname = removeLocalePrefix(pathname, locale);
  const accessToken = request.cookies.get("access_token")?.value;
  const userRole = request.cookies.get("user_role")?.value as
    | AppRole
    | undefined;

  const isAuthPath = isMatchingPath(appPathname, AUTH_PATHS);
  const isPublicPath = isMatchingPath(appPathname, PUBLIC_PATHS);

  if (appPathname === "/" && accessToken) {
    return redirectTo(request, locale, "/overview");
  }

  if (!accessToken && !isAuthPath && !isPublicPath) {
    const loginUrl = request.nextUrl.clone();

    loginUrl.pathname = getLocalizedPath(locale, "/login");
    loginUrl.search = "";
    loginUrl.searchParams.set("redirect", `${pathname}${search}`);

    return NextResponse.redirect(loginUrl);
  }

  if (accessToken && isAuthPath) {
    return redirectTo(request, locale, "/overview");
  }

  const roleGate = getRoleGate(appPathname);

  if (roleGate && !hasAllowedRole(userRole, roleGate.allowedRoles)) {
    return redirectTo(request, locale, "/unauthorized");
  }

  return handleI18nRouting(request);
}

export const config = {
  matcher: [
    "/((?!api|trpc|_next/static|_next/image|favicon.ico|icon.svg|.*\\..*).*)",
  ],
};
