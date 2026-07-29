"use client";

import { usePathname } from "next/navigation";

import { Sidebar, SidebarContent, SidebarHeader, SidebarMenu, SidebarProvider } from "@/components/ui/sidebar";
import { accountNavigation } from "../constants/account-navigation";
import type { AccountCustomer } from "../types/account";
import { AccountHeaderCard } from "./account-header-card";
import { AccountNavItem } from "./account-nav-item";

type AccountSidebarProps = {
  readonly customer: AccountCustomer;
};

export function AccountSidebar({ customer }: AccountSidebarProps) {
  const pathname = usePathname();

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
