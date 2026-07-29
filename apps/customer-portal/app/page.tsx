import { SiteFooter } from "@/components/layout/site-footer";
import { SiteHeader } from "@/components/layout/site-header";
import { CategorySection } from "@/components/home/category-section";
import { HeroSection } from "@/components/home/hero-section";
import { ServiceSection } from "@/components/home/service-section";
import { Testimonials } from "@/components/home/testimonials";
import { TrendingVideos } from "@/components/home/trending-videos";
import { BestOffers } from "@/src/features/products/components/best-offers";
import { GeneralProducts } from "@/src/features/products/components/general-products";

export default function Home() {
    return (
        <div className="flex min-h-full flex-1 flex-col">
            <SiteHeader />

            <main className="flex-1">
                <HeroSection />
                <CategorySection />

                <TrendingVideos />

                <BestOffers categorySlug="men" />
                <BestOffers categorySlug="women" />

                <GeneralProducts categorySlug="men-t-shirt" title="Explore Men T-Shirt" />
                <GeneralProducts categorySlug="women-sampot" title="Explore Women Sampot (Skirt)" />

                <ServiceSection />
                <Testimonials />
            </main>

            <SiteFooter />
        </div>
    );
}
