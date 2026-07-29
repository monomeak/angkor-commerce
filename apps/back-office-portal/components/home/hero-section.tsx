import Link from "next/link";
import { ArrowRight, Check, Sparkles } from "lucide-react";

import { DashboardPreview } from "@/components/home/dashboard-preview";
import { proofPoints } from "@/components/home/data";
import { Button } from "@/components/ui/button";

export function HeroSection() {
  return (
    <section className="relative z-10 mx-auto grid max-w-7xl items-center gap-14 px-5 pb-20 pt-16 sm:px-8 lg:grid-cols-[0.9fr_1.1fr] lg:pb-28 lg:pt-24">
      <div className="mx-auto max-w-2xl text-center lg:mx-0 lg:text-left">
        <HeroCopy />
      </div>
      <DashboardPreview />
    </section>
  );
}

function HeroCopy() {
  return (
    <>
      <div className="mb-6 inline-flex items-center gap-2 rounded-full border bg-background/80 px-3 py-1.5 text-xs font-medium shadow-sm">
        <Sparkles className="size-3.5" />
        Simple finances. Stronger business.
      </div>
      <h1 className="text-balance text-4xl font-semibold tracking-[-0.04em] sm:text-6xl sm:leading-[1.05]">
        Run your business, not your spreadsheets.
      </h1>
      <p className="mx-auto mt-6 max-w-xl text-pretty text-base leading-7 text-muted-foreground sm:text-lg lg:mx-0">
        Send invoices, track payments, and understand your cash flow from one
        calm, beautifully organized dashboard.
      </p>
      <HeroActions />
      <HeroProofPoints />
    </>
  );
}

function HeroActions() {
  return (
    <div className="mt-8 flex flex-col justify-center gap-3 sm:flex-row lg:justify-start">
      <Button
        className="h-11 px-5 text-sm"
        nativeButton={false}
        size="lg"
        render={<Link href="/login" />}
      >
        Start for free <ArrowRight data-icon="inline-end" />
      </Button>
      <Button
        className="h-11 px-5 text-sm"
        nativeButton={false}
        size="lg"
        variant="outline"
        render={<Link href="#preview" />}
      >
        See how it works
      </Button>
    </div>
  );
}

function HeroProofPoints() {
  return (
    <div className="mt-6 flex flex-wrap items-center justify-center gap-x-5 gap-y-2 text-xs text-muted-foreground lg:justify-start">
      {proofPoints.map((point) => (
        <span key={point} className="flex items-center gap-1.5">
          <Check className="size-3.5 text-foreground" /> {point}
        </span>
      ))}
    </div>
  );
}
