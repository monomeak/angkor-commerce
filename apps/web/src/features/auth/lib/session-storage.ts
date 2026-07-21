import type { AuthSession } from "../types/auth";

const SESSION_KEY = "auth_session";
const ACCESS_TOKEN_COOKIE = "access_token";
const USER_ROLE_COOKIE = "user_role";

function getCookieMaxAge(accessToken: string): number {
  try {
    const [, payload] = accessToken.split(".");
    const json = JSON.parse(window.atob(payload));
    if (typeof json.exp !== "number") return 60 * 30;

    return Math.max(0, json.exp - Math.floor(Date.now() / 1000));
  } catch {
    return 60 * 30;
  }
}

function setCookie(name: string, value: string, maxAge: number): void {
  const secure = window.location.protocol === "https:" ? "; Secure" : "";
  window.document.cookie = `${name}=${encodeURIComponent(
    value,
  )}; Path=/; SameSite=Lax; Max-Age=${maxAge}${secure}`;
}

function deleteCookie(name: string): void {
  window.document.cookie = `${name}=; Path=/; SameSite=Lax; Max-Age=0`;
}
/**
 * Minimal client-side session persistence.
 * Swap this out for httpOnly cookies handled by your backend/BFF
 * once you move past the "simple app" stage — localStorage is not
 * safe against XSS for production auth tokens.
 */
export const sessionStorageAdapter = {
  save(session: AuthSession): void {
    if (typeof window === "undefined") return;
    const maxAge = getCookieMaxAge(session.accessToken);

    window.localStorage.setItem(SESSION_KEY, JSON.stringify(session));
    setCookie(ACCESS_TOKEN_COOKIE, session.accessToken, maxAge);
    setCookie(USER_ROLE_COOKIE, session.user.role, maxAge);
  },
  load(): AuthSession | null {
    if (typeof window === "undefined") return null;
    const raw = window.localStorage.getItem(SESSION_KEY);
    if (!raw) return null;
    try {
      return JSON.parse(raw) as AuthSession;
    } catch {
      return null;
    }
  },
  clear(): void {
    if (typeof window === "undefined") return;
    window.localStorage.removeItem(SESSION_KEY);
    deleteCookie(ACCESS_TOKEN_COOKIE);
    deleteCookie(USER_ROLE_COOKIE);
  },
};
