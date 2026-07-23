"use client";

import { Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";

interface GenerateInsightsButtonProps {
  readonly onGeneate: () => void;
  readonly isPending: boolean;
  readonly disabled?: boolean;
}

export function GenerateInsightsButton({
  onGeneate,
  isPending,
  disabled,
}: GenerateInsightsButtonProps) {
  return (
    <Button
      size="lg"
      className="gap-1.5"
      onClick={onGeneate}
      disabled={isPending || disabled}
    >
      <Sparkles className="size-3.5">
        {isPending ? "Analyzing..." : "Generate insights"}
      </Sparkles>
    </Button>
  );
}
