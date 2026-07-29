import { Star } from "lucide-react";

import { Card, CardContent } from "@/components/ui/card";

// Placeholder sample quotes — swap for real customer reviews once the
// storefront has orders to draw from.
const testimonials = [
  {
    name: "Sokha P.",
    quote:
      "The krama quality is exactly like the ones from home. Fast delivery too.",
  },
  {
    name: "Dara K.",
    quote: "Bought a sampot for a family event — the weave and fit were perfect.",
  },
  {
    name: "Bopha S.",
    quote: "Great everyday basics for the kids, holds up well after washing.",
  },
];

export function Testimonials() {
  return (
    <section className="mx-auto max-w-6xl px-4 py-16 sm:px-6">
      <h2 className="text-3xl font-semibold tracking-[-0.03em] sm:text-4xl">
        What customers say
      </h2>
      <div className="mt-6 grid gap-4 sm:grid-cols-3">
        {testimonials.map((testimonial) => (
          <Card
            key={testimonial.name}
            className="bg-card/70 transition-transform duration-300 hover:-translate-y-1"
          >
            <CardContent className="flex flex-col gap-3">
              <div className="flex gap-0.5 text-accent">
                {Array.from({ length: 5 }).map((_, index) => (
                  <Star key={index} className="size-4 fill-current" />
                ))}
              </div>
              <p className="text-sm text-muted-foreground">
                &ldquo;{testimonial.quote}&rdquo;
              </p>
              <span className="text-sm font-medium">{testimonial.name}</span>
            </CardContent>
          </Card>
        ))}
      </div>
    </section>
  );
}
