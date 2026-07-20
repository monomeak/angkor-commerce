"use client";
import { formatLongDate, getGreeting } from "@/lib/utils";
import { useCurrentUser } from "@/src/features/auth/hooks/use-current-user";
import { DashboardOverviewView } from "@/src/features/dashboard-overview/views/dashboard-overview-view";
import { useEffect, useState } from "react";

export default function Dashboard() {
  const { data: currentUser } = useCurrentUser();
  const [date, setDate] = useState("");
  const [greeting, setGreeting] = useState("");

  useEffect(() => {
    (setDate(new Date().toUTCString()), setGreeting(getGreeting().toString()));
  }, []);
  return (
    <main className="flex flex-col gap-2">
      <div>
        <span className=" text-muted-foreground">{formatLongDate(date)}</span>
        <h1 className="flex flex-col items-left gap-2 text-2xl font-semibold pt-2">
          <span>
            {greeting || "Hello"}, {currentUser?.firstName}
          </span>
        </h1>
      </div>

      <DashboardOverviewView />
    </main>
  );
}
