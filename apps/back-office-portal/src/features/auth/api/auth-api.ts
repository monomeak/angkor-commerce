import { loginResponseSchema } from "../schemas/login.schema";
import type { DummyLoginResponse, DummyRegisterResponse, DummyCurrentUserResponse } from "../types/dummy-auth";
import type { ForgotPasswordPayload, LoginPayload, RegisterPayload } from "../types/auth";

/*
 * The API base URL is per-deployment config, not a build-time constant: it comes
 * from the server-only env through <AppConfigProvider>. Since useAppConfig() is a
 * hook it can only be read from a component or hook, so callers read it there and
 * pass it in — that keeps this module plain async functions, callable from
 * anywhere (hooks, tests, route handlers).
 */

export async function loginRequest(apiBaseUrl: string, payload: LoginPayload): Promise<DummyLoginResponse> {
    const res = await fetch(`${apiBaseUrl}/auth/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
            username: payload.username,
            password: payload.password
            // expiresInMins: payload.rememberMe ? 60 * 24 * 7 : 30
        })
    });

    if (!res.ok) {
        if (res.status === 400) throw new Error("Invalid username or password");

        throw new Error(`Login failed (${res.status})`);
    }

    const json = await res.json();
    const parsed = loginResponseSchema.safeParse(json);
    if (!parsed.success) {
        const message = parsed.error.issues[0]?.message ?? "Invalid Response format";
        throw new Error(message);
    }
    return parsed.data;
}

export async function fetchCurrentUser(apiBaseUrl: string, accessToken: string): Promise<DummyCurrentUserResponse> {
    const res = await fetch(`${apiBaseUrl}/auth/me`, {
        headers: { Authorization: `Bearer ${accessToken}` }
    });

    if (!res.ok) throw new Error("Failed to fetch current user");

    const user = res.json();
    return user;
}

export async function registerRequest(apiBaseUrl: string, payload: RegisterPayload): Promise<DummyRegisterResponse> {
    // DummyJSON has no real "register" endpoint — /users/add simulates
    // creation but doesn't persist. Swap for your real backend's
    // POST /auth/register when you have one.
    const res = await fetch(`${apiBaseUrl}/users/add`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
            username: payload.username,
            email: payload.email,
            password: payload.password,
            firstName: payload.firstName,
            lastName: payload.lastName
        })
    });

    if (!res.ok) throw new Error(`Registration failed (${res.status})`);
    return res.json();
}

export async function forgotPasswordRequest(payload: ForgotPasswordPayload): Promise<{ email: string }> {
    // DummyJSON does not provide a password reset endpoint. Keep the API boundary
    // here so this can become POST /auth/forgot-password when the backend exists.
    await new Promise((resolve) => setTimeout(resolve, 300));
    return { email: payload.email };
}
