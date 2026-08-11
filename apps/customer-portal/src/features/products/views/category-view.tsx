import Link from "next/link";
import { notFound } from "next/navigation";

import { CategoryPill } from "@/src/features/categories/components/category-pill";
import { getCategoryById, getCategoryBySlug, getChildCategories } from "@/src/features/categories/lib/category-helpers";
import { fetchProducts } from "../api/product-api";
import { ProductCard } from "../components/product-card";
import { ProductPagination } from "../components/product-pagination";
import { PriceRangeFilter } from "../components/price-range-filter";
import { PRODUCTS_PAGE_SIZE, resolvePage } from "../lib/pagination-helpers";
import { PRICE_FILTER_MAX, PRICE_FILTER_MIN, parsePriceParam } from "../lib/price-filter";

type CategoryViewProps = {
    readonly slug: string;
    readonly categoryParam?: string;
    readonly pageParam?: string;
    readonly minPriceParam?: string;
    readonly maxPriceParam?: string;
};

export async function CategoryView({
    slug,
    categoryParam,
    pageParam,
    minPriceParam,
    maxPriceParam
}: CategoryViewProps) {
    const category = getCategoryBySlug(slug);

    if (!category) {
        notFound();
    }

    const minPrice = parsePriceParam(minPriceParam, PRICE_FILTER_MIN);
    const maxPrice = parsePriceParam(maxPriceParam, PRICE_FILTER_MAX);
    const parent = category.parentId ? getCategoryById(category.parentId) : null;
    const children = getChildCategories(category.id);
    const activeChild =
        categoryParam && categoryParam !== "all" ? children.find((child) => child.slug === categoryParam) : undefined;
    const allProducts = await fetchProducts({
        categorySlug: activeChild?.slug ?? slug,
        minPrice,
        maxPrice
    });

    const totalPages = Math.max(1, Math.ceil(allProducts.length / PRODUCTS_PAGE_SIZE));
    const currentPage = resolvePage(pageParam, totalPages);
    const start = (currentPage - 1) * PRODUCTS_PAGE_SIZE;
    const products = allProducts.slice(start, start + PRODUCTS_PAGE_SIZE);

    return (
        <main className="mx-auto w-full max-w-6xl flex-1 px-4 py-10 sm:px-6">
            <nav className="text-sm text-muted-foreground" aria-label="Breadcrumb">
                <Link href="/" className="hover:text-foreground">
                    Home
                </Link>
                {parent && (
                    <>
                        {" / "}
                        <Link href={`/product/${parent.slug}`} className="hover:text-foreground">
                            {parent.name}
                        </Link>
                    </>
                )}
                {" / "}
                <span className="text-foreground">{category.name}</span>
            </nav>

            <h1 className="mt-2 text-3xl font-semibold tracking-[-0.03em] sm:text-4xl">{category.name}</h1>

            <div className="mt-4 flex flex-wrap items-center justify-between gap-4">
                {children.length > 0 ? (
                    <div className="flex flex-wrap gap-2">
                        <CategoryPill
                            href={buildCategoryHref(slug, undefined, minPrice, maxPrice)}
                            label="All"
                            active={!activeChild}
                        />
                        {children.map((child) => (
                            <CategoryPill
                                key={child.id}
                                href={buildCategoryHref(slug, child.slug, minPrice, maxPrice)}
                                label={child.name}
                                active={activeChild?.id === child.id}
                            />
                        ))}
                    </div>
                ) : (
                    <div />
                )}

                <PriceRangeFilter
                    minPrice={minPrice}
                    maxPrice={maxPrice}
                    basePath={`/product/${slug}`}
                    params={{ category: activeChild?.slug }}
                />
            </div>

            <div className="mt-8 grid grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
                {products.length > 0 ? (
                    products.map((product) => <ProductCard key={product.id} product={product} />)
                ) : (
                    <p className="col-span-full text-sm text-muted-foreground">No products in this category yet.</p>
                )}
            </div>

            {totalPages > 1 && (
                <ProductPagination
                    currentPage={currentPage}
                    totalPages={totalPages}
                    buildHref={(page) => buildCategoryHref(slug, activeChild?.slug, minPrice, maxPrice, page)}
                />
            )}
        </main>
    );
}

function buildCategoryHref(
    slug: string,
    categoryParam: string | undefined,
    minPrice: number,
    maxPrice: number,
    page?: number
): string {
    const params = new URLSearchParams();
    if (categoryParam) {
        params.set("category", categoryParam);
    }
    if (minPrice !== PRICE_FILTER_MIN) {
        params.set("minPrice", String(minPrice));
    }
    if (maxPrice !== PRICE_FILTER_MAX) {
        params.set("maxPrice", String(maxPrice));
    }
    if (page && page > 1) {
        params.set("page", String(page));
    }
    const query = params.toString();
    return `/product/${slug}${query ? `?${query}` : ""}`;
}
