import type { LucideIcon } from "lucide-react";

import { features } from "@/components/home/data";
import { IconBadge } from "@/components/home/icon-badge";
import { SectionHeading } from "@/components/home/section-heading";
import {
  Card,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

export function FeaturesSection() {
  return (
    <section
      id="features"
      className="mx-auto max-w-7xl px-5 py-20 sm:px-8 lg:py-28"
    >
      <SectionHeading
        eyebrow="Everything in one place"
        title="Less admin. More momentum."
        description="The essentials you need to stay paid, informed, and in control without the clutter."
      />
      <div className="mt-12 grid gap-4 md:grid-cols-3">
        {features.map((feature) => (
          <FeatureCard key={feature.title} {...feature} />
        ))}
      </div>
    </section>
  );
}

function FeatureCard({
  icon,
  title,
  description,
}: {
  icon: LucideIcon;
  title: string;
  description: string;
}) {
  return (
    <Card className="bg-card/70 transition-transform duration-300 hover:-translate-y-1">
      <CardHeader className="gap-4">
        <IconBadge icon={icon} />
        <div>
          <CardTitle>{title}</CardTitle>
          <CardDescription className="mt-2 leading-6">
            {description}
          </CardDescription>
        </div>
      </CardHeader>
    </Card>
  );
}
