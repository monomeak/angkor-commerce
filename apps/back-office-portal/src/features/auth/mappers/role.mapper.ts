import type { ApiRole, AppRole } from "../types/auth";

// Single source of truth for how backend roles map to our domain roles.
// Record<ApiRole, AppRole> forces TS to error if a case is ever missing.
const ROLE_MAP: Record<ApiRole, AppRole> = {
  admin: "super_admin",
  moderator: "shop_admin",
  user: "staff",
};

const REVERSE_ROLE_MAP: Record<AppRole, ApiRole> = {
  super_admin: "admin",
  shop_admin: "moderator",
  staff: "user",
};

const KNOWN_API_ROLES: ApiRole[] = ["admin", "user", "moderator"];

/** Safely parses an arbitrary string from the API into a known ApiRole. */
export function parseApiRole(value: string): ApiRole {
  if ((KNOWN_API_ROLES as string[]).includes(value)) {
    return value as ApiRole;
  }
  throw new Error(`Unrecognized API role: "${value}"`);
}

export function mapApiRoleToAppRole(role: ApiRole): AppRole {
  return ROLE_MAP[role];
}

export function mapAppRoleToApiRole(role: AppRole): ApiRole {
  return REVERSE_ROLE_MAP[role];
}

// Higher number = more privileged. Useful for gating UI/routes.
const ROLE_HIERARCHY: Record<AppRole, number> = {
  super_admin: 3,
  shop_admin: 2,
  staff: 1,
};

export function hasMinimumRole(userRole: AppRole, required: AppRole): boolean {
  return ROLE_HIERARCHY[userRole] >= ROLE_HIERARCHY[required];
}

// exposes the rank
export function getRoleRank(role: AppRole): number {
  return ROLE_HIERARCHY[role];
}
