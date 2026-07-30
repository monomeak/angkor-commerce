import { Carousel, CarouselContent, CarouselItem, CarouselNext, CarouselPrevious } from "@/components/ui/carousel";

// No real lookbook footage is wired up yet (see docs/NEXTJS_MIGRATION_PLAN.md
// "Assets Migration") — these are stock clips used only to exercise the
// player + carousel navigation. Swap the `url`s for real Angkor Commerce
// footage once it exists.
const trendingClips = [
    { id: 1, url: "https://videos.pexels.com/video-files/5889057/5889057-sd_640_360_25fps.mp4" },
    { id: 2, url: "https://videos.pexels.com/video-files/3959704/3959704-sd_960_506_25fps.mp4" },
    { id: 3, url: "https://videos.pexels.com/video-files/4715373/4715373-sd_960_506_25fps.mp4" },
    {
        id: 4,
        url: "https://videos.pexels.com/video-files/6272385/6272385-sd_426_240_30fps.mp4"
    },
    {
        id: 5,
        url: "https://videos.pexels.com/video-files/6238179/6238179-hd_1920_1080_25fps.mp4"
    },
    {
        id: 6,
        url: "https://videos.pexels.com/video-files/8177447/8177447-uhd_3840_2160_24fps.mp4"
    }
];

export function TrendingVideos() {
    return (
        <section className="mx-auto max-w-6xl px-4 py-16 sm:px-6">
            <h2 className="text-3xl font-semibold tracking-[-0.03em] sm:text-4xl">Trending now</h2>

            <Carousel className="mt-6" opts={{ align: "start" }}>
                <CarouselContent>
                    {trendingClips.map((clip) => (
                        <CarouselItem key={clip.id} className="sm:basis-1/2 lg:basis-1/3">
                            <div className="overflow-hidden rounded-xl border">
                                <video
                                    className="aspect-video w-full bg-muted"
                                    muted
                                    width={100}
                                    height={100}
                                    controls
                                    autoPlay
                                    preload="auto"
                                    playsInline
                                    loop
                                >
                                    <source src={clip.url} type="video/mp4" />
                                    Your browser does not support the video tag.
                                </video>
                            </div>
                        </CarouselItem>
                    ))}
                </CarouselContent>
                <CarouselPrevious />
                <CarouselNext />
            </Carousel>
        </section>
    );
}
