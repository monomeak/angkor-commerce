import type { AppRole } from "../types/auth";

interface RoleStyle {
  label: string;
  badgeClassName: string;
}

const ROLE_STYLES: Record<AppRole, RoleStyle> = {
  super_admin: {
    label: "Super Admin",
    badgeClassName:
      "bg-violet-50 text-violet-700 dark:bg-violet-500/10 dark:text-violet-400",
  },
  shop_admin: {
    label: "Shop Admin",
    badgeClassName:
      "bg-blue-50 text-blue-700 dark:bg-blue-500/10 dark:text-blue-400",
  },
  staff: {
    label: "Staff",
    badgeClassName:
      "bg-slate-100 text-slate-600 dark:bg-slate-500/10 dark:text-slate-400",
  },
};

export function getRoleStyle(role: AppRole): RoleStyle {
  return ROLE_STYLES[role];
}
