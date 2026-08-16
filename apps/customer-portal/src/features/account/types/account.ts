import type { LucideIcon } from "lucide-react";

type AccountNavigationBase = {
    label: string;
    icon: LucideIcon;
};

/** A row that navigates. */
export type AccountNavigationLink = AccountNavigationBase & { href: string };

/** A row that acts instead. Logout is the only one, and it confirms first. */
export type AccountNavigationAction = AccountNavigationBase & { action: "logout" };

export type AccountNavigationItem = AccountNavigationLink | AccountNavigationAction;
