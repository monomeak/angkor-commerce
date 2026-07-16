import { NextRequest } from "next/server";
import { NextResponse } from "next/server";
import { AppRole } from "./src/features/auth/types/auth";

const AUTH_PATHS = ["/login", "/register", "/forget-password"];
const PUB_PATH = ["/"];
const ROLE_GATED_PATHs: { prefix: string; allowRoles: AppRole[] }[] = [
  // temporay allows both super and admin at the same level
  // super admin will remove later for different app (back-office)
  { prefix: "/settings", allowRoles: ["super_admin", "shop_admin"] },
  { prefix: "/customers", allowRoles: ["super_admin", "shop_admin"] },
];
// route matching

function matchesPath(pathname: string, path: string): boolean {
  return pathname === path || pathname.startsWith(`${path}/`);
}

function isMatchingPath(pathname: string, paths: string[]): boolean {
  return paths.some((path) => matchesPath(pathname, path));
}

function getRoleGate(pathname: string) {
  return ROLE_GATED_PATHs.find(({ prefix }) => matchesPath(pathname, prefix));
}
// REDIRECT FUNCTION

function redirectTo(request: NextRequest, pathname: string): NextResponse {
  const url = request.nextUrl.clone();

  url.pathname = pathname;
  return NextResponse.redirect(url);
}

function hasAllowedRole(role: AppRole, allowedRoles: AppRole[]): boolean {
  return Boolean(role && allowedRoles.includes(role));
}

export function proxy(request: NextRequest) {
  const { pathname, search } = request.nextUrl;

  const accessToken = request.cookies.get("access_token")?.value;
  const userRole = request.cookies.get("user_role")?.value as AppRole;

  const authPath = isMatchingPath(pathname, AUTH_PATHS);
  const publicPath = isMatchingPath(pathname, PUB_PATH);

  // Redirect for root route for authenticated user

  if (pathname === "/" && accessToken) {
    return redirectTo(request, "/overview");
  }
  //  guest user want to access authenticated pages
  if (!accessToken && !authPath && !publicPath) {
    const loginUrl = request.nextUrl.clone();
    loginUrl.pathname = "/login";
    loginUrl.search = "";
    loginUrl.searchParams.set("redirect", `${pathname}${search}`);
    return NextResponse.redirect(loginUrl);
  }

  if (accessToken && authPath) {
    return redirectTo(request, "/overview");
  }

  const roleGate = getRoleGate(pathname);

  if (roleGate && !hasAllowedRole(userRole, roleGate.allowRoles)) {
    return redirectTo(request, "/unauthorized");
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    /*
     * Run auth proxy only for app routes. Exclude Next internals and files
     * like CSS, JS, images, fonts, and icons so styling/assets can load.
     */
    "/((?!_next/static|_next/image|favicon.ico|icon.svg|.*\\..*).*)",
  ],
};
