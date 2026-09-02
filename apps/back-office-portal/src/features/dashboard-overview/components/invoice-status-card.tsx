"use client";

import { useTranslations } from "next-intl";
import { Cell, Pie, PieChart, ResponsiveContainer, Tooltip } from "recharts";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { formatMoney } from "@/lib/formatters";
import type { InvoiceStatusBreakdown } from "../types/dashboard";

interface InvoiceStatusCardProps {
    readonly data: InvoiceStatusBreakdown[];
    readonly currency: string;
}

/** Fixed per status, so a slice keeps its colour as invoices move between statuses. */
const STATUS_COLORS: Record<string, string> = {
    PAID: "var(--chart-1)",
    PARTIALLY_PAID: "var(--chart-2)",
    ISSUED: "var(--chart-3)",
    CANCELLED: "var(--chart-4)"
};

export function InvoiceStatusCard({ data, currency }: InvoiceStatusCardProps) {
    const t = useTranslations("Overview");
    const tInvoices = useTranslations("Invoices");

    // The API sends every status, including empty ones, so the legend is stable — but a
    // zero-value slice would be an invisible sliver, so the chart itself only takes the rest.
    const slices = data.filter((entry) => entry.amount > 0);
    const totalAmount = slices.reduce((sum, entry) => sum + entry.amount, 0);

    return (
        <Card className="h-full min-w-0">
            <CardHeader>
                <CardTitle className="text-base font-semibold">{t("invoiceStatusTitle")}</CardTitle>
            </CardHeader>

            <CardContent>
                {totalAmount === 0 ? (
                    <p className="py-10 text-center text-sm text-muted-foreground">{t("noInvoices")}</p>
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
                                    dataKey="amount"
                                    nameKey="status"
                                    cx="50%"
                                    cy="50%"
                                    innerRadius={55}
                                    outerRadius={85}
                                    paddingAngle={3}
                                    stroke="none"
                                >
                                    {slices.map((entry) => (
                                        <Cell key={entry.status} fill={STATUS_COLORS[entry.status]} />
                                    ))}
                                </Pie>
                                <Tooltip
                                    formatter={(value, _name, item) => [
                                        formatMoney(Number(value), currency),
                                        tInvoices(`status_${item.payload.status}`)
                                    ]}
                                />
                            </PieChart>
                        </ResponsiveContainer>
                    </div>
                )}

                <ul className="mt-4 space-y-3">
                    {data.map((entry) => (
                        <li key={entry.status} className="flex items-center justify-between text-sm">
                            <div className="flex items-center gap-2.5">
                                <span
                                    className="size-2.5 rounded-full"
                                    style={{ backgroundColor: STATUS_COLORS[entry.status] }}
                                />
                                <span>{tInvoices(`status_${entry.status}`)}</span>
                                <span className="text-muted-foreground">({entry.count})</span>
                            </div>
                            <div className="text-right">
                                <p className="font-medium">{formatMoney(entry.amount, currency)}</p>
                                {totalAmount > 0 && (
                                    <p className="text-xs text-muted-foreground">
                                        {Math.round((entry.amount / totalAmount) * 100)}%
                                    </p>
                                )}
                            </div>
                        </li>
                    ))}
                </ul>
            </CardContent>
        </Card>
    );
}
