import type {
  DummyLoginResponse,
  DummyRegisterResponse,
  DummyCurrentUserResponse,
} from "../types/dummy-auth";
import type { AuthSession, AuthUser } from "../types/auth";
import { mapApiRoleToAppRole, parseApiRole } from "./role.mapper";

/**
 * DummyJSON's /auth/login response doesn't include a role field,
 * so it's passed in separately (fetched via /auth/me, or defaulted
 * to "user" for a simple app that doesn't need per-user roles yet).
 */
export function mapToAuthSession(
  dto: DummyLoginResponse,
  rawRole: string = "user",
): AuthSession {
  const user: AuthUser = {
    id: dto.id,
    username: dto.username,
    email: dto.email,
    firstName: dto.firstName,
    lastName: dto.lastName,
    gender: dto.gender as AuthUser["gender"],
    image: dto.image,
    role: mapApiRoleToAppRole(parseApiRole(rawRole)),
  };

  return {
    user,
    accessToken: dto.accessToken,
    refreshToken: dto.refreshToken,
  };
}

export function mapCurrentUserToAuthUser(
  dto: DummyCurrentUserResponse,
): AuthUser {
  return {
    id: dto.id,
    username: dto.username,
    email: dto.email,
    firstName: dto.firstName,
    lastName: dto.lastName,
    gender: dto.gender as AuthUser["gender"],
    image: dto.image,
    role: mapApiRoleToAppRole(parseApiRole(dto.role)),
  };
}

export function mapRegisterResponseToUser(
  dto: DummyRegisterResponse,
): Pick<
  AuthUser,
  "id" | "username" | "email" | "firstName" | "lastName" | "image"
> {
  return {
    id: dto.id,
    username: dto.username,
    email: dto.email,
    firstName: dto.firstName,
    lastName: dto.lastName,
    image: dto.image ?? "",
  };
}
