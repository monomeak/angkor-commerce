import type { AppRole } from "../types/auth";

/*
 * This replaces the old mappers/role.mapper.ts. core-api serialises its Role enum as
 * super_admin | shop_admin | staff — the same vocabulary the app already uses — so the
 * DummyJSON translation (admin→super_admin, moderator→shop_admin, user→staff) has no
 * job left. Only the ranking survives, which is what the team and route gates need.
 */

// Higher number = more privileged.
const ROLE_HIERARCHY: Record<AppRole, number> = {
    super_admin: 3,
    shop_admin: 2,
    staff: 1
};

export function getRoleRank(role: AppRole): number {
    return ROLE_HIERARCHY[role];
}

export function hasMinimumRole(userRole: AppRole, required: AppRole): boolean {
    return ROLE_HIERARCHY[userRole] >= ROLE_HIERARCHY[required];
}
