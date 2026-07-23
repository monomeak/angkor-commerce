"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

import { useGenerateInsights } from "../hooks/use-generate-insights";
import { GenerateInsightsButton } from "../components/generate-insights-button";
import { InsightsPanel } from "../components/insights-panel";
import { useStatusByMonth } from "../../reports/hooks/use-status-by-month";
import { useTopCustomers } from "../../reports/hooks/use-top-customers";
import { useState } from "react";

export function InsightsView() {
  const { data: statusByMonth, isLoading: statusLoading } = useStatusByMonth();
  const { data: topCustomers, isLoading: customerLoading } = useTopCustomers();
  const { mutate, data, isPending, isError, error } = useGenerateInsights();
  const [streamedText, setStreamedText] = useState("");

  const isDataReady =
    !statusLoading && !customerLoading && statusByMonth.length > 0;
  const handleGenerate = () => {
    setStreamedText("");
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
      onChunk: (chunkText) => setStreamedText((prev) => prev + chunkText),
    });
  };

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle className="text-base font-semibold">AI Insights</CardTitle>
        <GenerateInsightsButton
          onGeneate={handleGenerate}
          isPending={isPending}
          disabled={!isDataReady}
        ></GenerateInsightsButton>
      </CardHeader>
      <CardContent>
        <InsightsPanel
          insight={streamedText}
          isPending={isPending}
          isError={isError}
          error={error as Error | null}
        ></InsightsPanel>
      </CardContent>
    </Card>
  );
}
