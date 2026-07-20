"use client";
import { formatLongDate, getGreeting } from "@/lib/utils";
import { useCurrentUser } from "@/src/features/auth/hooks/use-current-user";
import { DashboardOverviewView } from "@/src/features/dashboard-overview/views/dashboard-overview-view";
export default function Dashboard() {
  const { data: currentUser } = useCurrentUser();
  const date = new Date().toUTCString();

  return (
    <main className="flex flex-col gap-2">
      <div>
        <span className=" text-muted-foreground">{formatLongDate(date)}</span>
        <h1 className="flex flex-col items-left gap-2 text-2xl font-semibold pt-2">
          <span>
            {getGreeting().toString()}, {currentUser?.firstName}
          </span>
        </h1>
      </div>

      <DashboardOverviewView />
    </main>
  );
}
