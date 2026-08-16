"use client";

import { useState } from "react";
import { usePathname } from "next/navigation";

import { Sidebar, SidebarContent, SidebarHeader, SidebarMenu, SidebarProvider } from "@/components/ui/sidebar";
import { LogoutConfirmDialog } from "@/src/features/auth/components/logout-confirm-dialog";
import { useCurrentCustomer } from "@/src/features/auth/hooks/use-current-customer";
import { useLogoutAndLeave } from "@/src/features/auth/hooks/use-logout";
import { accountNavigation, isNavigationLink } from "../lib/account-navigation";
import { AccountHeaderCard } from "./account-header-card";
import { AccountNavItem } from "./account-nav-item";

export function AccountSidebar() {
    const pathname = usePathname();
    const { data: customer } = useCurrentCustomer();
    const { logout } = useLogoutAndLeave();
    const [isConfirmingLogout, setIsConfirmingLogout] = useState(false);

    return (
        <SidebarProvider className="min-h-0 w-full md:w-auto">
            <Sidebar collapsible="none" className="w-full gap-0 bg-transparent text-foreground md:w-72 lg:w-[340px]">
                <SidebarHeader className="gap-0 p-0">
                    <AccountHeaderCard firstName={customer?.firstName ?? ""} />
                </SidebarHeader>

                <SidebarContent className="mt-14 gap-0 overflow-visible sm:mt-16">
                    <nav aria-label="Account navigation">
                        <SidebarMenu className="gap-1.5">
                            {accountNavigation.map((item) => (
                                <AccountNavItem
                                    key={item.label}
                                    item={item}
                                    isActive={isNavigationLink(item) && pathname === item.href}
                                    onSelect={() => setIsConfirmingLogout(true)}
                                />
                            ))}
                        </SidebarMenu>
                    </nav>
                </SidebarContent>
            </Sidebar>

            <LogoutConfirmDialog open={isConfirmingLogout} onOpenChange={setIsConfirmingLogout} onConfirm={logout} />
        </SidebarProvider>
    );
}
