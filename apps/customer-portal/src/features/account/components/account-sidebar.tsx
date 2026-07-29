"use client";

import { usePathname } from "next/navigation";

import { Sidebar, SidebarContent, SidebarHeader, SidebarMenu, SidebarProvider } from "@/components/ui/sidebar";
import { accountNavigation } from "../constants/account-navigation";
import { useAccount } from "../lib/account-context";
import { AccountHeaderCard } from "./account-header-card";
import { AccountNavItem } from "./account-nav-item";

export function AccountSidebar() {
  const pathname = usePathname();
  const { customer } = useAccount();

  return (
    <SidebarProvider className="min-h-0 w-full md:w-auto">
      <Sidebar
        collapsible="none"
        className="w-full gap-0 bg-transparent text-foreground md:w-72 lg:w-[340px]"
      >
        <SidebarHeader className="gap-0 p-0">
          <AccountHeaderCard firstName={customer.firstName} />
        </SidebarHeader>

        <SidebarContent className="mt-14 gap-0 overflow-visible sm:mt-16">
          <nav aria-label="Account navigation">
            <SidebarMenu className="gap-1.5">
              {accountNavigation.map((item) => (
                <AccountNavItem key={item.href} item={item} isActive={pathname === item.href} />
              ))}
            </SidebarMenu>
          </nav>
        </SidebarContent>
      </Sidebar>
    </SidebarProvider>
  );
}
