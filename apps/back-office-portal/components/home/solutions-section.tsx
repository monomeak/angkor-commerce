import type { LucideIcon } from "lucide-react";

import { solutions } from "@/components/home/data";
import { IconBadge } from "@/components/home/icon-badge";

export function SolutionsSection() {
  return (
    <section
      id="solutions"
      className="mx-auto max-w-7xl px-5 pb-20 scroll-mt-24 sm:px-8 lg:pb-28"
    >
      <div className="grid gap-10 lg:grid-cols-[0.8fr_1.2fr] lg:items-start">
        <div>
          <p className="text-sm font-medium text-muted-foreground">Solutions</p>
          <h2 className="mt-3 text-3xl font-semibold tracking-[-0.03em] sm:text-4xl">
            One workspace for the work behind every payment.
          </h2>
          <p className="mt-4 text-base leading-7 text-muted-foreground">
            Angkor connects the everyday billing steps that small teams repeat:
            invoice creation, payment tracking, and revenue review.
          </p>
        </div>
        <div className="grid gap-4 sm:grid-cols-3">
          {solutions.map((solution) => (
            <SolutionCard key={solution.title} {...solution} />
          ))}
        </div>
      </div>
    </section>
  );
}

function SolutionCard({
  icon,
  title,
  description,
}: {
  icon: LucideIcon;
  title: string;
  description: string;
}) {
  return (
    <div className="rounded-xl border bg-card p-5 shadow-sm">
      <IconBadge icon={icon} />
      <h3 className="mt-5 text-sm font-semibold">{title}</h3>
      <p className="mt-2 text-sm leading-6 text-muted-foreground">
        {description}
      </p>
    </div>
  );
}
