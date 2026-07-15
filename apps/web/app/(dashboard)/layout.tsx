import { ReactNode } from "react";
import AppSidebar from "@/components/layout/app-sidebar";
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar";
import DashboardHeader from "@/components/layout/dashboard-header";

type DashboardLayoutProps = {
  readonly children: ReactNode;
};

export default function DashboardLayout({ children }: DashboardLayoutProps) {
  return (
    <SidebarProvider>
      <AppSidebar></AppSidebar>
      <SidebarInset>
        <DashboardHeader></DashboardHeader>
        <main className="flex-1 px-4 py-4 md:p-6">
          <div className="mx-auto w-full max-w-7xl">{children}</div>
        </main>
      </SidebarInset>
    </SidebarProvider>
  );
}
