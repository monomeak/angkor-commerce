"use client";

import { getCategoryBySlug } from "@/src/features/categories/lib/category-helpers";
import { Skeleton } from "@/components/ui/skeleton";
import { useProductsQuery } from "../hooks/use-products";
import { ProductCard } from "./product-card";

type BestOffersProps = {
  readonly categorySlug: string;
};

export function BestOffers({ categorySlug }: BestOffersProps) {
  const category = getCategoryBySlug(categorySlug);
  const { data: products, isLoading } = useProductsQuery({ categorySlug });
  const offers = (products ?? []).filter((product) => product.promotionPercentage > 0);

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
          ? Array.from({ length: 4 }).map((_, index) => (
              <Skeleton key={index} className="aspect-[3/4] w-full" />
            ))
          : offers.map((product) => <ProductCard key={product.id} product={product} />)}
      </div>
    </section>
  );
}
