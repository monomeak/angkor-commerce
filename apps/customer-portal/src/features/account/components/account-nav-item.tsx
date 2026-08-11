import Link from "next/link";

import { SidebarMenuButton, SidebarMenuItem } from "@/components/ui/sidebar";
import { cn } from "@/lib/utils";
import type { AccountNavigationItem } from "../types/account";

type AccountNavItemProps = {
  readonly item: AccountNavigationItem;
  readonly isActive: boolean;
};

export function AccountNavItem({ item, isActive }: AccountNavItemProps) {
  const Icon = item.icon;

  return (
    <SidebarMenuItem>
      <SidebarMenuButton
        isActive={isActive}
        size="lg"
        render={<Link href={item.href} aria-current={isActive ? "page" : undefined} />}
        className={cn(
          "relative gap-3 bg-card font-medium text-foreground hover:bg-account-accent/5",
          "data-active:bg-card data-active:text-account-accent",
          isActive && "text-account-accent",
        )}
      >
        <span
          aria-hidden="true"
          className={cn(
            "absolute inset-y-0 left-0 w-1.5 bg-account-accent-bar transition-transform duration-200",
            isActive ? "scale-y-100" : "scale-y-0",
          )}
        />
        <Icon className="size-5 shrink-0" />
        <span>{item.label}</span>
      </SidebarMenuButton>
    </SidebarMenuItem>
  );
}
