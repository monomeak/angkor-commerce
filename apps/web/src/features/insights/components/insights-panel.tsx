"use client";

import Markdown from "react-markdown";

import remarkGfm from "remark-gfm";
import type { Components } from "react-markdown";

interface InsightsPanelProps {
  readonly insight?: string;
  readonly isPending: boolean;
  readonly isError: boolean;
  readonly error: Error | null;
}

const markdownComponents: Components = {
  p: ({ children }) => (
    <p className="mb-3 text-sm leading-relaxed last:mb-0">{children}</p>
  ),
  strong: ({ children }) => (
    <strong className="font-semibold">{children}</strong>
  ),
  em: ({ children }) => <em className="italic">{children}</em>,
  ul: ({ children }) => (
    <ul className="mb-3 list-disc space-y-1 pl-5 text-sm">{children}</ul>
  ),
  ol: ({ children }) => (
    <ol className="mb-3 list-decimal space-y-1 pl-5 text-sm">{children}</ol>
  ),
  li: ({ children }) => <li>{children}</li>,
  h1: ({ children }) => (
    <h3 className="mb-2 mt-4 text-base font-semibold first:mt-0">{children}</h3>
  ),
  h2: ({ children }) => (
    <h3 className="mb-2 mt-4 text-sm font-semibold first:mt-0">{children}</h3>
  ),
  h3: ({ children }) => (
    <h4 className="mb-1 mt-3 text-sm font-semibold first:mt-0">{children}</h4>
  ),
  code: ({ children }) => (
    <code className="rounded bg-muted px-1 py-0.5 text-xs">{children}</code>
  ),
  a: ({ children, href }) => (
    <a
      href={href}
      target="_blank"
      rel="noreferrer"
      className="underline underline-offset-2"
    >
      {children}
    </a>
  ),
  table: ({ children }) => (
    <div className="mb-3 overflow-x-auto">
      <table className="w-full text-sm">{children}</table>
    </div>
  ),
  th: ({ children }) => (
    <th className="border-b py-1.5 pr-3 text-left font-medium text-muted-foreground">
      {children}
    </th>
  ),
  td: ({ children }) => <td className="border-b py-1.5 pr-3">{children}</td>,
};

export function InsightsPanel({
  insight,
  isPending,
  isError,
  error,
}: InsightsPanelProps) {
  if (isPending && !insight) {
    return (
      <p
        className="flex items-center gap-2 text-sm text-muted-foreground"
        role="status"
      >
        <span className="size-2 animate-pulse rounded-full bg-current" />
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
        Click &quot;Generate insights&quot; to get an AI-written summary of the
        reports above.
      </p>
    );
  }

  return (
    // <div className="whitespace-pre-wrap text-sm leading-relaxed">{insight}</div>

    <div aria-live="polite" aria-busy={isPending}>
      <Markdown remarkPlugins={[remarkGfm]} components={markdownComponents}>
        {insight}
      </Markdown>

      {isPending && (
        <span
          className="ml-0.5 inline-block h-4 w-0.5 animate-pulse rounded-full bg-foreground/70 align-text-bottom"
          aria-hidden="true"
        />
      )}
    </div>
  );
}
