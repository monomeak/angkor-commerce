import { Star } from "lucide-react";

// Placeholder sample quotes — swap for real customer reviews once the
// storefront has orders to draw from.
const testimonials = [
    {
        name: "Sokha P.",
        quote: "The krama quality is exactly like the ones from home. Fast delivery too."
    },
    {
        name: "Dara K.",
        quote: "Bought a sampot for a family event — the weave and fit were perfect."
    },
    {
        name: "Bopha S.",
        quote: "Great everyday basics for the kids, holds up well after washing."
    }
];

export function Testimonials() {
    return (
        <section id="testimonials" className="relative scroll-mt-24 border-y bg-muted/30 py-16 sm:py-20">
            <div className="mx-auto max-w-6xl px-4 sm:px-6">
                <div className="max-w-2xl">
                    <h2 className="mt-3 text-3xl font-semibold tracking-[-0.03em] sm:text-4xl">What customers say</h2>
                </div>
                <TestimonialMarquee />
            </div>
        </section>
    );
}

function TestimonialMarquee() {
    return (
        <div className="group relative mt-10 overflow-hidden">
            <div className="pointer-events-none absolute inset-y-0 left-0 z-10 w-12 bg-gradient-to-r from-muted/30 to-transparent sm:w-24" />
            <div className="pointer-events-none absolute inset-y-0 right-0 z-10 w-12 bg-gradient-to-l from-muted/30 to-transparent sm:w-24" />
            <div className="flex w-max gap-4 [animation:testimonial-marquee_34s_linear_infinite] group-hover:[animation-play-state:paused] group-focus-within:[animation-play-state:paused] motion-reduce:animate-none">
                {[...testimonials, ...testimonials].map((testimonial, index) => (
                    <TestimonialCard
                        key={`${testimonial.name}-${index}`}
                        testimonial={testimonial}
                        isDuplicate={index >= testimonials.length}
                    />
                ))}
            </div>
        </div>
    );
}

function TestimonialCard({
    testimonial,
    isDuplicate
}: {
    testimonial: (typeof testimonials)[number];
    isDuplicate: boolean;
}) {
    return (
        <div
            aria-hidden={isDuplicate || undefined}
            className="flex w-72 shrink-0 flex-col gap-3 rounded-xl border bg-card/70 p-5 sm:w-80 cursor-pointer"
        >
            <div className="flex gap-0.5 text-accent">
                {Array.from({ length: 5 }).map((_, index) => (
                    <Star key={index} className="size-4 fill-current" />
                ))}
            </div>
            <p className="text-sm text-muted-foreground">&ldquo;{testimonial.quote}&rdquo;</p>
            <span className="text-sm font-medium">{testimonial.name}</span>
        </div>
    );
}
