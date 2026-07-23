import { useMutation } from "@tanstack/react-query";
import { generateInsightsStream } from "../api/insights-api";
import { InsightsRequestPayload } from "../types/insights";

interface GenerateInsightsVariables {
  payload: InsightsRequestPayload;
  /** Called with each new chunk of text as it streams in, for live rendering. */
  onChunk: (chunkText: string) => void;
}

/**
 * useMutation, not useQuery — every call costs money/compute on the AI
 * provider, so this should only ever run when the user explicitly
 * clicks "Generate insights," never automatically on mount or refetch.
 */

export function useGenerateInsights() {
  return useMutation({
    mutationKey: ["insights", "generate"],
    mutationFn: ({ payload, onChunk }: GenerateInsightsVariables) => {
      return generateInsightsStream(payload, onChunk);
    },
  });
}
