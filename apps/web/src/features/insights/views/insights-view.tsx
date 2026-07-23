"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

import { useGenerateInsights } from "../hooks/use-generate-insights";
import { GenerateInsightsButton } from "../components/generate-insights-button";
import { InsightsPanel } from "../components/insights-panel";
import { useStatusByMonth } from "../../reports/hooks/use-status-by-month";
import { useTopCustomers } from "../../reports/hooks/use-top-customers";

import { useTypewriterBuffer } from "../hooks/use-typewriter-butter";

export function InsightsView() {
  const { data: statusByMonth, isLoading: statusLoading } = useStatusByMonth();
  const { data: topCustomers, isLoading: customerLoading } = useTopCustomers();
  const { mutate, isPending, isError, error } = useGenerateInsights();

  // Network chunks feed into `push()`; `displayedText` reveals them at a
  // steady pace regardless of how jumpy the actual arrival was.
  const { displayedText, push, reset, isRevealing } = useTypewriterBuffer();

  const isStillTyping = isPending || isRevealing;

  const isDataReady =
    !statusLoading && !customerLoading && statusByMonth.length > 0;
  const handleGenerate = () => {
    reset();
    mutate({
        payload: {
          statusByMonth: statusByMonth.map(
            ({ month, paid, pending, overdue, draft }) => ({
              month,
              paid,
              pending,
              overdue,
              draft,
            }),
          ),
          // Deliberately drop email/avatarUrl/userId — only send what's
          // needed for analysis, since this leaves our server for a
          // third-party AI provider.
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
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle className="text-base font-semibold">AI Insights</CardTitle>
        <GenerateInsightsButton
          onGenerate={handleGenerate}
          isPending={isStillTyping}
          disabled={!isDataReady}
        ></GenerateInsightsButton>
      </CardHeader>
      <CardContent>
        <InsightsPanel
          insight={displayedText}
          isPending={isStillTyping}
          isError={isError}
          error={error as Error | null}
        ></InsightsPanel>
      </CardContent>
    </Card>
  );
}
