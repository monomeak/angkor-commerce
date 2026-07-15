"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroupContent,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar";

import { AcmeLogo } from "../acme-logo";

import { sidebarNavigation } from "./sidebar-navigation";
import { SidebarCollapsibleGroup } from "./side-setting-group";

export default function AppSidebar() {
  const pathname = usePathname();
  const isActivePath = (href: string) =>
    pathname === href || pathname.startsWith(`${href}/`);

  return (
    <Sidebar collapsible="icon">
      <SidebarHeader className="border-b group-data-[collapsible=icon]:items-center group-data-[collapsible=icon]:p-2">
        <AcmeLogo
          href="/overview"
          size="lg"
          showName={true}
          className="group-data-[collapsible=icon]:gap-0 group-data-[collapsible=icon]:[&>span:last-child]:hidden"
        />
      </SidebarHeader>

      <SidebarContent>
        <SidebarGroupContent>
          <SidebarMenu className="gap-3 p-4 group-data-[collapsible=icon]:items-center group-data-[collapsible=icon]:px-2">
            {sidebarNavigation.map((item) => {
              const hasChildren = item.items && item.items.length > 0;
              if (!hasChildren) {
                const isActive =
                  item.href === "/overview"
                    ? pathname === "/overview"
                    : isActivePath(item.href);
                return (
                  <SidebarMenuItem key={item.href}>
                    <SidebarMenuButton
                      render={<Link href={item.href}></Link>}
                      isActive={isActive}
                      tooltip={item.title}
                    >
                      <item.icon></item.icon>
                      <span>{item.title}</span>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                );
              }

              return (
                <SidebarCollapsibleGroup
                  key={item.title}
                  item={item}
                  pathname={pathname}
                />
              );
            })}
          </SidebarMenu>
        </SidebarGroupContent>
      </SidebarContent>
      <SidebarFooter className="border-t">
        <div className="p-2 text-xs text-muted-foreground">
          <span className="group-data-[collapsible=icon]:hidden">
            Acme Invoice v1.0
          </span>
        </div>
      </SidebarFooter>
    </Sidebar>
  );
}
