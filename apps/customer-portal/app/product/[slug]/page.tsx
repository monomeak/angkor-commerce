import { SiteFooter } from "@/components/layout/site-footer";
import { SiteHeader } from "@/components/layout/site-header";
import { CategoryView } from "@/src/features/products/views/category-view";

type CategoryPageProps = {
    readonly params: Promise<{ slug: string }>;
    readonly searchParams: Promise<{ category?: string; page?: string; minPrice?: string; maxPrice?: string }>;
};

export default async function CategoryPage({ params, searchParams }: CategoryPageProps) {
    const { slug } = await params;
    const { category, page, minPrice, maxPrice } = await searchParams;

    return (
        <div className="flex min-h-full flex-1 flex-col">
            <SiteHeader />

            <CategoryView
                slug={slug}
                categoryParam={category}
                pageParam={page}
                minPriceParam={minPrice}
                maxPriceParam={maxPrice}
            />

            <SiteFooter />
        </div>
    );
}
