"use client";
import { ChevronRight } from "lucide-react";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "../ui/collapsible";
import {
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarMenuSub,
  SidebarMenuSubButton,
  SidebarMenuSubItem,
  useSidebar,
} from "../ui/sidebar";
import { sidebarNavigation } from "./sidebar-navigation";
import React from "react";
import { useTranslations } from "next-intl";
import { Link } from "@/app/i18n/navigation";
import { AppRole } from "@/src/features/auth/types/auth";

type SidebarGroupItem = (typeof sidebarNavigation)[number];

type SidebarCollapsibleGroupProps = {
  readonly item: SidebarGroupItem;
  readonly pathname: string;
  readonly userRole?: AppRole;
};

export function SidebarCollapsibleGroup({
  item,
  pathname,
  userRole,
}: SidebarCollapsibleGroupProps) {
  const t = useTranslations("Navigation");
  const { state, setOpen: setSidebarOpen } = useSidebar();
  const isSidebarCollapsed = state === "collapsed";
  const isGroupActive =
    pathname === item.href ||
    pathname.startsWith(`${item.href}/`) ||
    (item.items?.some(
      (subItem) =>
        pathname === subItem.href || pathname.startsWith(`${subItem.href}/`),
    ) ??
      false);

  const visibleSubItems = item.items?.filter(
    (subItem) =>
      !subItem.allowedRoles ||
      (userRole && subItem.allowedRoles.includes(userRole)),
  );
  const [groupOpen, setGroupOpen] = React.useState(false);
  const isOpen = !isSidebarCollapsed && (groupOpen || isGroupActive);
  const openSidebarIfCollapsed = () => {
    if (isSidebarCollapsed) {
      setSidebarOpen(true);
    }
  };

  return (
    <Collapsible
      open={isOpen}
      onOpenChange={(nextOpen) => {
        if (!isSidebarCollapsed) {
          setGroupOpen(nextOpen);
        }
      }}
    >
      <SidebarMenuItem>
        <CollapsibleTrigger
          render={
            <SidebarMenuButton
              isActive={isGroupActive}
              tooltip={t(item.titleKey)}
              onMouseEnter={openSidebarIfCollapsed}
              onFocus={openSidebarIfCollapsed}
              onClick={openSidebarIfCollapsed}
              className="group/settings-trigger"
            />
          }
        >
          <item.icon className="size-4" />

          <span>{t(item.titleKey)}</span>

          <ChevronRight
            className={[
              "ml-auto size-4 shrink-0",
              "group-data-[collapsible=icon]:hidden",
              "transition-transform duration-300 ease-in-out",
              isOpen ? "rotate-90" : "rotate-0",
            ].join(" ")}
          />
        </CollapsibleTrigger>

        <CollapsibleContent
          className="
            overflow-hidden
            data-[open]:animate-collapsible-down
            data-[closed]:animate-collapsible-up
          "
        >
          <SidebarMenuSub className="mt-2 gap-2">
            {visibleSubItems?.map((subItem) => {
              const isSubItemActive =
                pathname === subItem.href ||
                pathname.startsWith(`${subItem.href}/`);

              return (
                <SidebarMenuSubItem key={subItem.href}>
                  <SidebarMenuSubButton
                    render={<Link href={subItem.href} />}
                    isActive={isSubItemActive}
                    className="
                      transition-colors duration-200
                      data-active:bg-sidebar-accent
                      data-active:font-medium
                      data-active:text-sidebar-accent-foreground
                    "
                  >
                    {subItem.icon && <subItem.icon className="size-4" />}

                    <span>{t(subItem.titleKey)}</span>
                  </SidebarMenuSubButton>
                </SidebarMenuSubItem>
              );
            })}
          </SidebarMenuSub>
        </CollapsibleContent>
      </SidebarMenuItem>
    </Collapsible>
  );
}
