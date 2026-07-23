"use client";

import { Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";

interface GenerateInsightsButtonProps {
  readonly onGenerate: () => void;
  readonly isPending: boolean;
  readonly disabled?: boolean;
}

export function GenerateInsightsButton({
  onGenerate,
  isPending,
  disabled,
}: GenerateInsightsButtonProps) {
  return (
    <Button
      size="lg"
      className="gap-1.5"
      onClick={onGenerate}
      disabled={isPending || disabled}
    >
      <Sparkles className={`size-3.5 ${isPending ? "animate-pulse" : ""}`} />
      {isPending ? "Analyzing..." : "Generate insights"}
    </Button>
  );
}
