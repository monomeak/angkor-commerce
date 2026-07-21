"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState } from "react";

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
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
import { LogOut } from "lucide-react";
import { useAuthSession } from "@/src/features/auth/hooks/use-auth-session";
import { useCurrentUser } from "@/src/features/auth/hooks/use-current-user";

const LOGOUT_DELAY_MS = 300;

export default function AppSidebar() {
  const router = useRouter();
  const { logout } = useAuthSession();
  const { data: currentUser } = useCurrentUser();
  const [isLogoutDialogOpen, setIsLogoutDialogOpen] = useState(false);
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const handleLogout = () => {
    if (isLoggingOut) return;

    setIsLogoutDialogOpen(true);
  };

  const confirmLogout = () => {
    if (isLoggingOut) return;

    setIsLoggingOut(true);

    window.setTimeout(() => {
      logout();
      router.replace("/login");
    }, LOGOUT_DELAY_MS);
  };

  const visibleNavigation = sidebarNavigation.filter((item) => {
    if (!item.allowedRoles) return true;
    if (!mounted || !currentUser) return false;
    return item.allowedRoles.includes(currentUser.role);
  });
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
            {visibleNavigation.map((item) => {
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
                  userRole={currentUser?.role}
                />
              );
            })}
          </SidebarMenu>
        </SidebarGroupContent>
      </SidebarContent>
      <SidebarFooter className="border-t">
        <SidebarContent>
          <SidebarMenuItem key="logout">
            <AlertDialog
              open={isLogoutDialogOpen}
              onOpenChange={(open) => {
                if (!isLoggingOut) {
                  setIsLogoutDialogOpen(open);
                }
              }}
            >
              <AlertDialogTrigger
                render={
                  <SidebarMenuButton
                    onClick={handleLogout}
                    disabled={isLoggingOut}
                    className="text-red-600 hover:text-red-700"
                  />
                }
              >
                <LogOut className="text-red-600" />
                <span>{isLoggingOut ? "Logging out..." : "Logout"}</span>
              </AlertDialogTrigger>

              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>
                    Are you sure you want to log out?
                  </AlertDialogTitle>
                  <AlertDialogDescription>
                    You will be redirected to the login page.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel disabled={isLoggingOut}>
                    Cancel
                  </AlertDialogCancel>
                  <AlertDialogAction
                    variant="destructive"
                    onClick={confirmLogout}
                    disabled={isLoggingOut}
                  >
                    {isLoggingOut ? "Logging out..." : "Logout"}
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          </SidebarMenuItem>
        </SidebarContent>
        <div className="p-2 text-xs text-muted-foreground">
          <span className="group-data-[collapsible=icon]:hidden">
            Acme Invoice v1.0
          </span>
        </div>
      </SidebarFooter>
    </Sidebar>
  );
}
