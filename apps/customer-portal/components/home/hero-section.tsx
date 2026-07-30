"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import Autoplay from "embla-carousel-autoplay";
import { ArrowRight } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Carousel, CarouselContent, CarouselItem, type CarouselApi } from "@/components/ui/carousel";
import { cn } from "@/lib/utils";

const heroHighlights = [
    { id: 1, src: "/hero-1.png", alt: "Men's everyday wear in front of Angkor Wat" },
    { id: 2, src: "/hero-2.png", alt: "Traditional sampot styling at Angkor Wat" },
    { id: 3, src: "/hero-3.png", alt: "Couple wearing Angkor Commerce styles at sunset" }
];

const modernWords = ["comfort", "ease", "living"];

export function HeroSection() {
    const [api, setApi] = useState<CarouselApi>();
    const [selectedIndex, setSelectedIndex] = useState(0);
    const [wordIndex, setWordIndex] = useState(0);

    useEffect(() => {
        if (!api) return;

        setSelectedIndex(api.selectedScrollSnap());
        api.on("select", () => setSelectedIndex(api.selectedScrollSnap()));
    }, [api]);

    useEffect(() => {
        const interval = setInterval(() => {
            setWordIndex((current) => (current + 1) % modernWords.length);
        }, 2500);

        return () => clearInterval(interval);
    }, []);

    return (
        <section className="relative overflow-hidden border-b bg-gradient-to-br from-secondary via-background to-background">
            <div className="mx-auto grid max-w-6xl grid-cols-1 items-center gap-10 px-4 py-20 sm:px-6 sm:py-28 lg:grid-cols-2">
                <div className="flex flex-col items-start gap-6">
                    {/* <span className="inline-flex items-center gap-2 rounded-full border bg-background/80 px-3 py-1.5 text-xs font-medium text-muted-foreground shadow-sm">
                        Khmer clothing, made for everyday life
                    </span> */}
                    <h1 className="text-balance max-w-xl text-4xl font-semibold tracking-[-0.04em] sm:text-6xl sm:leading-[1.05]">
                        Traditional craft, modern{" "}
                        <span className="relative inline-block overflow-hidden align-bottom">
                            <span
                                key={wordIndex}
                                className="inline-block text-primary duration-500 animate-in fade-in slide-in-from-bottom-2"
                            >
                                {modernWords[wordIndex]}
                            </span>
                        </span>
                    </h1>
                    <p className="max-w-md text-lg text-muted-foreground">
                        Krama, sampot, and everyday essentials for men, women, and children — sourced from local makers.
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

                <div className="w-full">
                    <Carousel
                        setApi={setApi}
                        opts={{ loop: true }}
                        plugins={[Autoplay({ delay: 4000, stopOnInteraction: false })]}
                    >
                        <CarouselContent>
                            {heroHighlights.map((highlight) => (
                                <CarouselItem key={highlight.id}>
                                    <div className="relative aspect-square w-full overflow-hidden rounded-3xl">
                                        <Image
                                            src={highlight.src}
                                            alt={highlight.alt}
                                            priority={highlight.id === 1}
                                            fill
                                            className="object-cover object-center"
                                            sizes="(min-width: 1024px) 500px, 100vw"
                                        />
                                    </div>
                                </CarouselItem>
                            ))}
                        </CarouselContent>
                    </Carousel>

                    <div className="mt-4 flex items-center justify-center gap-2">
                        {heroHighlights.map((highlight, index) => (
                            <button
                                key={highlight.id}
                                type="button"
                                aria-label={`Show highlight ${index + 1}`}
                                aria-current={selectedIndex === index}
                                onClick={() => api?.scrollTo(index)}
                                className={cn(
                                    "h-1.5 rounded-full transition-all duration-300",
                                    selectedIndex === index
                                        ? "w-6 bg-primary"
                                        : "w-1.5 bg-primary/30 hover:bg-primary/50"
                                )}
                            />
                        ))}
                    </div>
                </div>
            </div>
        </section>
    );
}
