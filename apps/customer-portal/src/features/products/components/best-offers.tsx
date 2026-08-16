"use client";

import { getCategoryBySlug } from "@/src/features/categories/lib/category-helpers";
import { useCategories } from "@/src/features/categories/hooks/use-categories";
import { Skeleton } from "@/components/ui/skeleton";
import { useProductsQuery } from "../hooks/use-products";
import { ProductCard } from "./product-card";

type BestOffersProps = {
    readonly categorySlug: string;
};

/** How many rows to look through for discounted products. */
const SCAN_LIMIT = 24;
const SHOWN = 4;

export function BestOffers({ categorySlug }: BestOffersProps) {
    const category = getCategoryBySlug(useCategories(), categorySlug);
    const { data, isLoading } = useProductsQuery({ categorySlug, limit: SCAN_LIMIT });

    /*
     * core-api has no "discounted only" filter, so the discount is picked out of a page of
     * results rather than asked for. That means this shows the best offers among the first
     * SCAN_LIMIT products of the category, not across the whole catalogue — fine for a
     * home-page teaser, worth revisiting if the API grows a `hasDiscount` filter.
     */
    const offers = (data?.products ?? []).filter((product) => product.discountPercentage > 0).slice(0, SHOWN);

    if (!isLoading && offers.length === 0) {
        return null;
    }

    return (
        <section className="mx-auto max-w-6xl px-4 py-10 sm:px-6">
            <h2 className="text-3xl font-semibold tracking-[-0.03em] sm:text-4xl">
                Best offers — {category?.name ?? categorySlug}
            </h2>
            <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
                {isLoading
                    ? Array.from({ length: SHOWN }).map((_, index) => (
                          <Skeleton key={index} className="aspect-[3/4] w-full" />
                      ))
                    : offers.map((product) => <ProductCard key={product.id} product={product} />)}
            </div>
        </section>
    );
}
