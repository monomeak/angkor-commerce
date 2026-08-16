import { Heart, Lock, LogOut, ShoppingCart, User } from "lucide-react";

import type { AccountNavigationItem, AccountNavigationLink } from "../types/account";

export const accountNavigation: AccountNavigationItem[] = [
    {
        label: "My Orders",
        href: "/account/orders",
        icon: ShoppingCart
    },
    {
        label: "My Favorites",
        href: "/account/favorites",
        icon: Heart
    },
    {
        label: "Account Overview",
        href: "/account",
        icon: User
    },
    {
        label: "Change Password",
        href: "/account/change-password",
        icon: Lock
    },
    {
        label: "Log out",
        action: "logout",
        icon: LogOut
    }
];

export function isNavigationLink(item: AccountNavigationItem): item is AccountNavigationLink {
    return "href" in item;
}
