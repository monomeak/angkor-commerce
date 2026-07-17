"use client";
import { formatLongDate, getGreeting } from "@/lib/utils";
import { useCurrentUser } from "@/src/features/auth/hooks/use-current-user";

export default function Dashboard() {
  const { data: currentUser } = useCurrentUser();
  const date = new Date().toUTCString();

  return (
    <main>
      <span className=" text-muted-foreground">{formatLongDate(date)}</span>
      <h1 className="flex flex-col items-left gap-2 text-2xl font-semibold pt-2">
        <span>
          {getGreeting().toString()}, {currentUser?.firstName}
        </span>
      </h1>
    </main>
  );
}
