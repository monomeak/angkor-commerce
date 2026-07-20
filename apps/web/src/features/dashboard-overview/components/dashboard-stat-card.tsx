import { TrendingDown, TrendingUp } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import type { DashboardStat } from "../types/dashboard";
interface DashboardStatCardProps {
  readonly stat: DashboardStat;
}

export function DashboardStatCard({ stat }: DashboardStatCardProps) {
  const { label, value, change, icon: Icon } = stat;
  const isUp = change.direction === "up";

  return (
    <Card>
      <CardContent className="flex items-start justify-between p-6">
        <div className="space-y-1">
          <p className="text-sm text-muted-foreground">{label}</p>
          <p className="text-2xl font-semibold tracking-tight">{value}</p>
          <div
            // cn allow css to be combibed based a condition
            className={cn(
              "inline-flex items-center gap-1 text-xs font-medium",
              isUp
                ? "text-emerald-600 dark:text-emerald-400"
                : "text-red-600 dark:text-red-400",
            )}
          >
            {isUp ? (
              <TrendingUp className="h-3.5 w-3.5" />
            ) : (
              <TrendingDown className="h-3.5 w-3.5" />
            )}
            <span>{change.value}</span>
            <span className="text-muted-foreground font-normal"></span>
          </div>
        </div>

        <div className="rounded-lg bg-muted p-2.5">
          <Icon className="h-5 w-5 text-foreground" />
        </div>
      </CardContent>
    </Card>
  );
}
