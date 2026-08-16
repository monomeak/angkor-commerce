"use client";

import { Skeleton } from "@/components/ui/skeleton";
import { useProductsQuery } from "../hooks/use-products";
import { ProductCard } from "./product-card";

type GeneralProductsProps = {
    readonly categorySlug: string;
    readonly title: string;
};

const SHOWN = 4;

export function GeneralProducts({ categorySlug, title }: GeneralProductsProps) {
    const { data, isLoading } = useProductsQuery({ categorySlug, limit: SHOWN });
    const products = data?.products ?? [];

    if (!isLoading && products.length === 0) {
        return null;
    }

    return (
        <section className="mx-auto max-w-6xl px-4 py-10 sm:px-6">
            <h2 className="text-3xl font-semibold tracking-[-0.03em] sm:text-4xl">{title}</h2>
            <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
                {isLoading
                    ? Array.from({ length: SHOWN }).map((_, index) => (
                          <Skeleton key={index} className="aspect-[3/4] w-full" />
                      ))
                    : products.map((product) => <ProductCard key={product.id} product={product} />)}
            </div>
        </section>
    );
}
