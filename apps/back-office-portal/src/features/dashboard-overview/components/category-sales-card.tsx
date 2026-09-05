"use client";

import { useTranslations } from "next-intl";
import { Cell, Pie, PieChart, ResponsiveContainer, Tooltip } from "recharts";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { formatMoney } from "@/lib/formatters";
import type { CategorySales } from "../types/dashboard";

interface CategorySalesCardProps {
    readonly data: CategorySales[];
    readonly currency: string;
}

/**
 * Categories are data, not an enum, so a colour is taken by position and wraps once the shop
 * has more top-level categories than the theme has chart colours.
 */
const CHART_COLORS = ["var(--chart-1)", "var(--chart-2)", "var(--chart-3)", "var(--chart-4)", "var(--chart-5)"];

const colorFor = (index: number) => CHART_COLORS[index % CHART_COLORS.length];

export function CategorySalesCard({ data, currency }: CategorySalesCardProps) {
    const t = useTranslations("Overview");

    // The API sends every top-level category, including the ones nothing sold in, so the
    // legend is stable — but a zero-value slice is an invisible sliver, so the chart skips it.
    const slices = data
        .map((entry, index) => ({ ...entry, color: colorFor(index) }))
        .filter((entry) => entry.unitsSold > 0);
    const totalUnits = slices.reduce((sum, entry) => sum + entry.unitsSold, 0);

    return (
        <Card className="h-full min-w-0">
            <CardHeader>
                <CardTitle className="text-base font-semibold">{t("categorySalesTitle")}</CardTitle>
                <p className="text-sm text-muted-foreground">{t("categorySalesSubtitle")}</p>
            </CardHeader>

            <CardContent>
                {totalUnits === 0 ? (
                    <p className="py-10 text-center text-sm text-muted-foreground">{t("noSales")}</p>
                ) : (
                    <div className="h-56 w-full min-w-0">
                        <ResponsiveContainer
                            width="100%"
                            height="100%"
                            minWidth={0}
                            initialDimension={{ width: 320, height: 224 }}
                        >
                            <PieChart>
                                <Pie
                                    data={slices}
                                    dataKey="unitsSold"
                                    nameKey="category"
                                    cx="50%"
                                    cy="50%"
                                    innerRadius={55}
                                    outerRadius={85}
                                    paddingAngle={3}
                                    stroke="none"
                                >
                                    {slices.map((entry) => (
                                        <Cell key={entry.categoryId} fill={entry.color} />
                                    ))}
                                </Pie>
                                <Tooltip
                                    formatter={(value, _name, item) => [
                                        t("unitsSold", { count: Number(value) }),
                                        item.payload.category
                                    ]}
                                />
                            </PieChart>
                        </ResponsiveContainer>
                    </div>
                )}

                <ul className="mt-4 space-y-3">
                    {data.map((entry, index) => (
                        <li key={entry.categoryId} className="flex items-center justify-between text-sm">
                            <div className="flex items-center gap-2.5">
                                <span className="size-2.5 rounded-full" style={{ backgroundColor: colorFor(index) }} />
                                <span>{entry.category}</span>
                            </div>
                            <div className="text-right">
                                <p className="font-medium">{t("unitsSold", { count: entry.unitsSold })}</p>
                                {/* <p className="text-xs text-muted-foreground">
                                        {formatMoney(entry.amount, currency)}
                                        {totalUnits > 0 && ` · ${Math.round((entry.unitsSold / totalUnits) * 100)}%`}
                                    </p> */}
                            </div>
                        </li>
                    ))}
                </ul>
            </CardContent>
        </Card>
    );
}
