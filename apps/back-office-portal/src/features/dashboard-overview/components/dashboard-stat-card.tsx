"use client";

import { useTranslations } from "next-intl";
import { TrendingDown, TrendingUp } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import type { DashboardStat } from "../types/dashboard";

interface DashboardStatCardProps {
    readonly stat: DashboardStat;
}

export function DashboardStatCard({ stat }: DashboardStatCardProps) {
    const t = useTranslations("Overview");
    const { key, value, change, icon: Icon } = stat;

    return (
        <Card>
            <CardContent className="flex items-start justify-between p-6">
                <div className="space-y-1">
                    <p className="text-sm text-muted-foreground">{t(key)}</p>
                    <p className="text-2xl font-semibold tracking-tight">{value}</p>
                    {/* Only revenue has a previous period to compare against; the rest of the
                        cards are totals, and an invented trend on those is what this replaced. */}
                    {change && (
                        <div
                            className={cn(
                                "inline-flex items-center gap-1 text-xs font-medium",
                                change.direction === "up"
                                    ? "text-emerald-600 dark:text-emerald-400"
                                    : "text-red-600 dark:text-red-400"
                            )}
                        >
                            {change.direction === "up" ? (
                                <TrendingUp className="h-3.5 w-3.5" />
                            ) : (
                                <TrendingDown className="h-3.5 w-3.5" />
                            )}
                            <span>{change.value}</span>
                            <span className="font-normal text-muted-foreground">{t("vsLastMonth")}</span>
                        </div>
                    )}
                </div>

                <div className="rounded-lg bg-muted p-2.5">
                    <Icon className="h-5 w-5 text-foreground" />
                </div>
            </CardContent>
        </Card>
    );
}
