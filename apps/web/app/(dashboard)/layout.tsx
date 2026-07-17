"use client";
import { ReactNode } from "react";
import AppSidebar from "@/components/layout/app-sidebar";
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar";
import DashboardHeader from "@/components/layout/dashboard-header";
import { useCurrentUser } from "@/src/features/auth/hooks/use-current-user";

type DashboardLayoutProps = {
  readonly children: ReactNode;
};

export default function DashboardLayout({ children }: DashboardLayoutProps) {
  // const { formProfile } = useProfile();
  const { data: currentProfile } = useCurrentUser();
  return (
    <SidebarProvider>
      <AppSidebar></AppSidebar>
      <SidebarInset>
        <DashboardHeader profilePath={currentProfile?.image}></DashboardHeader>
        <main className="flex-1 px-4 py-4 md:p-6">
          <div className="mx-auto w-full max-w-7xl">{children}</div>
        </main>
      </SidebarInset>
    </SidebarProvider>
  );
}
