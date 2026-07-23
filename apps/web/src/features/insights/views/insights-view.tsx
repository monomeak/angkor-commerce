"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useStatusByMonth } from "../../reports/hooks/use-status-by-month";
import { useTopCustomers } from "../../reports/hooks/use-top-customers";
import { GenerateInsightsButton } from "../components/generate-insights-button";
import { InsightsPanel } from "../components/insights-panel";
import { useGenerateInsights } from "../hooks/use-generate-insights";
import { useTypewriterBuffer } from "../hooks/use-typewriter-butter";

const PERIOD_OPTIONS = {
  all: "Overall insight",
  "3": "Last 3 months",
  "6": "Last 6 months",
} as const;

type Period = keyof typeof PERIOD_OPTIONS;

export function InsightsView() {
  const [period, setPeriod] = useState<Period>("all");
  const months = period === "all" ? undefined : Number(period);
  const { data: statusByMonth, isLoading: statusLoading } =
    useStatusByMonth(months);
  const { data: topCustomers, isLoading: customerLoading } =
    useTopCustomers(months);
  const { mutate, isPending, isError, error } = useGenerateInsights();
  const { displayedText, push, reset, isRevealing } = useTypewriterBuffer();

  const isStillTyping = isPending || isRevealing;
  const isDataReady =
    !statusLoading && !customerLoading && statusByMonth.length > 0;

  const handleGenerate = () => {
    reset();
    mutate({
      payload: {
        periodLabel: PERIOD_OPTIONS[period],
        statusByMonth: statusByMonth.map(
          ({ month, paid, pending, overdue, draft }) => ({
            month,
            paid,
            pending,
            overdue,
            draft,
          }),
        ),
        // Deliberately omit private customer fields before calling the AI.
        topCustomers: topCustomers.map(
          ({ fullName, company, invoiceCount, totalRevenue }) => ({
            fullName,
            company,
            invoiceCount,
            totalRevenue,
          }),
        ),
      },
      onChunk: push,
    });
  };

  return (
    <Card>
      <CardHeader className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <CardTitle className="text-base font-semibold">AI Insights</CardTitle>
        <div className="flex items-center gap-2">
          <label htmlFor="select">Target:</label>
          <Select
            value={period}
            disabled={isStillTyping}
            onValueChange={(value) => {
              setPeriod(value as Period);
              reset();
            }}
          >
            <SelectTrigger aria-label="Insight reporting period">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {Object.entries(PERIOD_OPTIONS).map(([value, label]) => (
                <SelectItem key={value} value={value}>
                  {label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <GenerateInsightsButton
            onGenerate={handleGenerate}
            isPending={isStillTyping}
            disabled={!isDataReady}
          />
        </div>
      </CardHeader>
      <CardContent>
        <InsightsPanel
          insight={displayedText}
          isPending={isStillTyping}
          isError={isError}
          error={error as Error | null}
        />
      </CardContent>
    </Card>
  );
}
