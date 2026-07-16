import type { AuthSession } from "../types/auth";

const SESSION_KEY = "auth_session";
/**
 * Minimal client-side session persistence.
 * Swap this out for httpOnly cookies handled by your backend/BFF
 * once you move past the "simple app" stage — localStorage is not
 * safe against XSS for production auth tokens.
 */
export const sessionStorageAdapter = {
  save(session: AuthSession): void {
    if (typeof window === "undefined") return;
    window.localStorage.setItem(SESSION_KEY, JSON.stringify(session));
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
  },
};
