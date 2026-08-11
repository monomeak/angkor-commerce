"use client";

import { usePathname } from "next/navigation";

import { Sidebar, SidebarContent, SidebarHeader, SidebarMenu, SidebarProvider } from "@/components/ui/sidebar";
import { useCurrentCustomer } from "@/src/features/auth/hooks/use-current-customer";
import { accountNavigation } from "../lib/account-navigation";
import { AccountHeaderCard } from "./account-header-card";
import { AccountNavItem } from "./account-nav-item";

export function AccountSidebar() {
  const pathname = usePathname();
  const { data: customer } = useCurrentCustomer();

  return (
    <SidebarProvider className="min-h-0 w-full md:w-auto">
      <Sidebar
        collapsible="none"
        className="w-full gap-0 bg-transparent text-foreground md:w-72 lg:w-[340px]"
      >
        <SidebarHeader className="gap-0 p-0">
          <AccountHeaderCard firstName={customer?.firstName ?? ""} />
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
