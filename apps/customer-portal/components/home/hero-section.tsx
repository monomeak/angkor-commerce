import Link from "next/link";
import { ArrowRight } from "lucide-react";

import { Button } from "@/components/ui/button";

export function HeroSection() {
  return (
    <section className="relative overflow-hidden border-b bg-gradient-to-br from-secondary via-background to-background">
      <div className="mx-auto flex max-w-6xl flex-col items-start gap-6 px-4 py-20 sm:px-6 sm:py-28">
        <span className="inline-flex items-center gap-2 rounded-full border bg-background/80 px-3 py-1.5 text-xs font-medium text-muted-foreground shadow-sm">
          Khmer clothing, made for everyday life
        </span>
        <h1 className="text-balance max-w-xl text-4xl font-semibold tracking-[-0.04em] sm:text-6xl sm:leading-[1.05]">
          Traditional craft, modern comfort
        </h1>
        <p className="max-w-md text-lg text-muted-foreground">
          Krama, sampot, and everyday essentials for men, women, and
          children — sourced from local makers.
        </p>
        <div className="flex flex-col gap-3 sm:flex-row">
          <Button
            variant="accent"
            size="lg"
            className="h-11 px-5 text-sm"
            nativeButton={false}
            render={<Link href="/product/home" />}
          >
            Shop now
            <ArrowRight data-icon="inline-end" className="size-4" />
          </Button>
          <Button
            variant="outline"
            size="lg"
            className="h-11 px-5 text-sm"
            nativeButton={false}
            render={<Link href="/product/women" />}
          >
            Explore women&apos;s sampot
          </Button>
        </div>
      </div>
    </section>
  );
}
