interface InsightsPanelProps {
  readonly insight?: string;
  readonly isPending: boolean;
  readonly isError: boolean;
  readonly error: Error | null;
}

export function InsightsPanel({
  insight,
  isPending,
  isError,
  error,
}: InsightsPanelProps) {
  if (isPending) {
    return (
      <p className="text-sm text-muted-foreground">
        Analyzing your invoice data...
      </p>
    );
  }

  if (isError) {
    return (
      <p className="text-sm text-red-600">
        {error?.message ?? "Something went wrong generating insights."}
      </p>
    );
  }

  if (!insight) {
    return (
      <p className="text-sm text-muted-foreground">
        Click "Generate insights" to get an AI-written summary of the reports
        above.
      </p>
    );
  }

  return (
    <div className="whitespace-pre-wrap text-sm leading-relaxed">{insight}</div>
  );
}
