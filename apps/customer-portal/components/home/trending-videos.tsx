import { Play } from "lucide-react";

import { Card } from "@/components/ui/card";

// The legacy app streamed remote lookbook videos here. No video assets are
// wired up yet (see docs/NEXTJS_MIGRATION_PLAN.md "Assets Migration") — this
// placeholder preserves the section's place in the layout until real clips
// are added.
const trendingClips = [
  { id: 1, title: "Sampot styling for everyday wear" },
  { id: 2, title: "How krama is woven" },
  { id: 3, title: "Men's collection lookbook" },
];

export function TrendingVideos() {
  return (
    <section className="mx-auto max-w-6xl px-4 py-16 sm:px-6">
      <h2 className="text-3xl font-semibold tracking-[-0.03em] sm:text-4xl">
        Trending now
      </h2>
      <div className="mt-6 grid gap-4 sm:grid-cols-3">
        {trendingClips.map((clip) => (
          <Card
            key={clip.id}
            className="flex aspect-video items-center justify-center bg-muted/60 p-4 transition-transform duration-300 hover:-translate-y-1"
          >
            <div className="flex flex-col items-center gap-2 text-center">
              <span className="flex size-10 items-center justify-center rounded-full bg-background/80 text-primary">
                <Play className="size-4" />
              </span>
              <span className="text-sm text-muted-foreground">{clip.title}</span>
            </div>
          </Card>
        ))}
      </div>
    </section>
  );
}
