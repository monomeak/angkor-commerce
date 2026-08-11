import { Heart, Lock, ShoppingCart, User } from "lucide-react";

import type { AccountNavigationItem } from "../types/account";

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
    }
    // {
    //   label: "Payment Methods",
    //   href: "/account/payment-methods",
    //   icon: CreditCard,
    // },
];
