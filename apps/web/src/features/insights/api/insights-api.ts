import { InsightsResult, InsightsRequestPayload } from "../types/insights";

export async function generateInsights(
  payload: InsightsRequestPayload,
): Promise<InsightsResult> {
  const res = await fetch("/api/insights/analyze", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });

  if (!res.ok) {
    const body = await res.json().catch(() => null);
    throw new Error(
      body?.error ?? `Failed to generate insights (${res.status})`,
    );
  }
  return res.json();
}

export async function generateInsightsStream(
  payload: InsightsRequestPayload,
  onChunk: (chunkText: string) => void,
): Promise<string> {
  const res = await fetch("/api/insights/analyze", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });

  if (!res.ok) {
    const body = await res.json().catch(() => null);
    throw new Error(
      body?.error ?? `Failed to generate insights (${res.status})`,
    );
  }

  if (!res.body) {
    throw new Error("No response stream received.");
  }
  // decode the text
  const reader = res.body.getReader();
  const decoder = new TextDecoder();
  let fullText = "";

  while (true) {
    const { value, done } = await reader.read();
    if (done) {
      break;
    }

    const chunkText = decoder.decode(value, { stream: true });
    fullText += chunkText;
    onChunk(chunkText);
  }

  return fullText;
}
