// src/components/layout/sidebar-navigation.ts

import {
  FileText,
  LayoutDashboard,
  Settings,
  Users,
  UserRoundCog,
  ChartNoAxesCombined,
  ChartPie,
  UserRound,
  Palette,
  LockKeyhole,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";

type SideBarMenu = {
  title: string;
  href: string;
  icon: LucideIcon;
  items?: SidebarSubMenuItem[];
};

type SidebarSubMenuItem = Omit<SideBarMenu, "items">;
export const sidebarNavigation: SideBarMenu[] = [
  {
    title: "Overview",
    href: "/overview",
    icon: LayoutDashboard,
  },
  {
    title: "Invoices",
    href: "/invoices",
    icon: FileText,
  },
  {
    title: "Customers",
    href: "/customers",
    icon: Users,
  },
  {
    title: "Reports",
    href: "/reports",
    icon: ChartNoAxesCombined,
  },
  {
    title: "Analytics",
    href: "/analytics",
    icon: ChartPie,
  },
  {
    title: "Team & Roles",
    href: "/team",
    icon: UserRoundCog,
  },
  {
    title: "Settings",
    href: "/settings",
    icon: Settings,
    items: [
      {
        title: "My Profile",
        href: "/settings/profile",
        icon: UserRound,
      },
      {
        title: "Appearance",
        href: "/settings/appearance",
        icon: Palette,
      },
      {
        title: "Privacy and Security",
        href: "/settings/privacy-security",
        icon: LockKeyhole,
      },
    ],
  },
];
