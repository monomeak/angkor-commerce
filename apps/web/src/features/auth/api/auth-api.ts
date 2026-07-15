import { loginResponseSchema } from "../schemas/login.schema";
import type {
  DummyLoginResponse,
  DummyRegisterResponse,
  DummyCurrentUserResponse,
} from "../types/dummy-auth";
import type {
  LoginPayload,
  RegisterPayload,
} from "../types/auth";

import { env } from "@/config/env";

const BASE_URL = env.apiBaseUrl;

export async function loginRequest(
  payload: LoginPayload,
): Promise<DummyLoginResponse> {
  const res = await fetch(`${BASE_URL}/auth/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      username: payload.username,
      password: payload.password,
      expiresInMins: payload.rememberMe ? 60 * 24 * 7 : 30,
    }),
  });

  if (!res.ok) {
    if (res.status === 400) throw new Error("Invalid username or password");
    throw new Error(`Login falied (${res.status})`);
  }

  const json = await res.json();
  const parsed = loginResponseSchema.safeParse(json);
  if (!parsed.success) {
    throw new Error("Unexpected login response shape");
  }

  return parsed.data;
}

export async function fetchCurrentUser(
  accessToken: string,
): Promise<DummyCurrentUserResponse> {
  const res = await fetch(`${BASE_URL}/auth/me`, {
    headers: { Authorization: `Bearer ${accessToken}` },
  });

  if (!res.ok) throw new Error("Failed to fetch current user");

  const user = res.json();
  return user;
}

export async function registerRequest(
  payload: RegisterPayload,
): Promise<DummyRegisterResponse> {
  // DummyJSON has no real "register" endpoint — /users/add simulates
  // creation but doesn't persist. Swap for your real backend's
  // POST /auth/register when you have one.
  const res = await fetch(`${BASE_URL}/users/add`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      username: payload.username,
      email: payload.email,
      password: payload.password,
      firstName: payload.firstName,
      lastName: payload.lastName,
    }),
  });

  if (!res.ok) throw new Error(`Registration failed (${res.status})`);
  return res.json();
}
