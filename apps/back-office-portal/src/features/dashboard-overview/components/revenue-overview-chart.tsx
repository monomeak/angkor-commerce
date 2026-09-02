"use client";

import { useTranslations } from "next-intl";
import { Area, AreaChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { formatMoney } from "@/lib/formatters";
import { monthLabel } from "../lib/stats";
import type { RevenuePoint } from "../types/dashboard";

interface RevenueOverviewChartProps {
    readonly data: RevenuePoint[];
    readonly currency: string;
    readonly months: number;
}

/**
 * One series, not two. The old chart split "paid" against "pending" revenue, which core-api
 * cannot answer and never could: money is either received (a COMPLETED payment) or it is an
 * invoice balance, and a balance is not revenue. Outstanding has its own KPI card instead.
 */
export function RevenueOverviewChart({ data, currency, months }: RevenueOverviewChartProps) {
    const t = useTranslations("Overview");
    const points = data.map((point) => ({ ...point, label: monthLabel(point.month) }));

    return (
        <Card className="h-full min-w-0">
            <CardHeader>
                <CardTitle className="text-base font-semibold">{t("revenueTitle")}</CardTitle>
                <p className="text-sm text-muted-foreground">{t("revenueSubtitle", { months })}</p>
            </CardHeader>
            <CardContent>
                <div className="h-[280px] w-full min-w-0">
                    <ResponsiveContainer
                        width="100%"
                        height="100%"
                        minWidth={0}
                        initialDimension={{ width: 800, height: 280 }}
                    >
                        <AreaChart data={points} margin={{ top: 8, right: 8, left: 0, bottom: 0 }}>
                            <defs>
                                <linearGradient id="revenueGradient" x1="0" y1="0" x2="0" y2="1">
                                    <stop offset="0%" stopColor="var(--chart-1)" stopOpacity={0.35} />
                                    <stop offset="100%" stopColor="var(--chart-1)" stopOpacity={0} />
                                </linearGradient>
                            </defs>

                            <CartesianGrid vertical={false} strokeDasharray="3 3" className="stroke-muted" />
                            <XAxis
                                dataKey="label"
                                axisLine={false}
                                tickLine={false}
                                className="fill-muted-foreground text-xs"
                            />
                            <YAxis
                                axisLine={false}
                                tickLine={false}
                                width={72}
                                className="fill-muted-foreground text-xs"
                                tickFormatter={(value: number) => formatMoney(value, currency)}
                            />
                            <Tooltip
                                formatter={(value) => [formatMoney(Number(value), currency), t("revenueTitle")]}
                                contentStyle={{
                                    borderRadius: "0.5rem",
                                    border: "1px solid var(--border)",
                                    background: "var(--background)"
                                }}
                            />
                            <Area
                                type="monotone"
                                dataKey="revenue"
                                stroke="var(--chart-1)"
                                strokeWidth={2}
                                fill="url(#revenueGradient)"
                            />
                        </AreaChart>
                    </ResponsiveContainer>
                </div>
            </CardContent>
        </Card>
    );
}
