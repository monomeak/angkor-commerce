import { ApiError, apiFetch, parseResponse } from "@/lib/api-client";
import { authenticatedUserSchema, currentUserSchema } from "../schemas/user.schema";
import { mapToAuthUser, mapToCurrentUser } from "../mappers/auth.mapper";
import type {
    AuthUser,
    CurrentUser,
    ForgotPasswordPayload,
    LoginPayload,
    UpdateProfilePayload
} from "../types/auth";

/*
 * The API base URL is per-deployment config, not a build-time constant: it comes
 * from the server-only env through <AppConfigProvider>. Since useAppConfig() is a
 * hook it can only be read from a component or hook, so callers read it there and
 * pass it in — that keeps this module plain async functions, callable from
 * anywhere (hooks, tests, route handlers).
 *
 * Tokens never appear here: core-api sets httpOnly accessToken/refreshToken cookies,
 * and apiFetch sends them with credentials: "include".
 */
const AUTH_BASE = "/auth";

export async function loginRequest(apiBaseUrl: string, payload: LoginPayload): Promise<AuthUser> {
    const data = await apiFetch<unknown>(apiBaseUrl, `${AUTH_BASE}/login`, {
        method: "POST",
        body: JSON.stringify(payload),
        // A 401 here means "wrong password", not "expired token" — refreshing and
        // replaying would just fail twice and hide the real message.
        retryOnUnauthorized: false
    });

    return mapToAuthUser(parseResponse(authenticatedUserSchema, data));
}

export async function logoutRequest(apiBaseUrl: string): Promise<void> {
    await apiFetch<void>(apiBaseUrl, `${AUTH_BASE}/logout`, { method: "POST", retryOnUnauthorized: false });
}

/**
 * Returns null when nobody is signed in: the cookies are httpOnly, so asking the API
 * is the only way to find out, and a 401 here is an expected answer rather than a fault.
 */
export async function fetchCurrentUser(apiBaseUrl: string): Promise<CurrentUser | null> {
    try {
        const data = await apiFetch<unknown>(apiBaseUrl, `${AUTH_BASE}/me`);
        return mapToCurrentUser(parseResponse(currentUserSchema, data));
    } catch (cause) {
        if (cause instanceof ApiError && cause.status === 401) {
            return null;
        }
        throw cause;
    }
}

export async function updateProfileRequest(apiBaseUrl: string, payload: UpdateProfilePayload): Promise<CurrentUser> {
    const data = await apiFetch<unknown>(apiBaseUrl, `${AUTH_BASE}/me`, {
        method: "PATCH",
        body: JSON.stringify(payload)
    });

    return mapToCurrentUser(parseResponse(currentUserSchema, data));
}

/**
 * core-api's back-office AuthController has no /register: staff accounts are created by
 * an administrator through POST /users, which is itself authenticated and role-gated. So
 * self-service signup cannot work here, and the DummyJSON version only ever simulated it.
 * Failing loudly beats a form that appears to succeed and creates nothing.
 */
export async function registerRequest(): Promise<never> {
    throw new ApiError("Staff accounts are created by an administrator under Team, not by signing up.", 501);
}

export async function forgotPasswordRequest(payload: ForgotPasswordPayload): Promise<{ email: string }> {
    // core-api has no password-reset endpoint yet. Keep the API boundary here so this
    // can become POST /auth/forgot-password once it exists.
    await new Promise((resolve) => setTimeout(resolve, 300));
    return { email: payload.email };
}
