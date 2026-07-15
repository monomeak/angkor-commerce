import Link from "next/link";
import { ArrowRight } from "lucide-react";

import { Button } from "@/components/ui/button";

export function CtaSection() {
  return (
    <section
      id="pricing"
      className="mx-auto max-w-7xl px-5 pb-14 sm:px-8 lg:pb-20"
    >
      <div className="flex flex-col items-center justify-between gap-8 rounded-3xl bg-primary px-6 py-12 text-center text-primary-foreground sm:px-12 lg:flex-row lg:py-14 lg:text-left">
        <div>
          <h2 className="text-3xl font-semibold tracking-[-0.03em]">
            Ready for a clearer workday?
          </h2>
          <p className="mt-3 text-sm text-primary-foreground/70 sm:text-base">
            Join growing businesses that spend less time chasing numbers.
          </p>
        </div>
        <Button
          className="h-11 bg-background px-5 text-foreground hover:bg-background/90"
          nativeButton={false}
          size="lg"
          render={<Link href="/login" />}
        >
          Start for free <ArrowRight data-icon="inline-end" />
        </Button>
      </div>
    </section>
  );
}
