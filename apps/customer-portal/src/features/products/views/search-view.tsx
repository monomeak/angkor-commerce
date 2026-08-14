import { getAppConfig } from "@/lib/app-config.server";
import { CategoryPill } from "@/src/features/categories/components/category-pill";
import { fetchCategories } from "@/src/features/categories/api/category-api";
import { getTopLevelCategories } from "@/src/features/categories/lib/category-helpers";
import { fetchProducts } from "../api/product-api";
import { ProductCard } from "../components/product-card";
import { NoSearchResults, SearchPrompt } from "../components/product-empty-states";
import { ProductPagination } from "../components/product-pagination";
import { PriceRangeFilter } from "../components/price-range-filter";
import { PRODUCTS_PAGE_SIZE, resolvePage } from "../lib/pagination-helpers";
import {
    PRICE_FILTER_MAX,
    PRICE_FILTER_MIN,
    isPriceFiltered,
    parsePriceParam,
    toPriceFilter
} from "../lib/price-filter";

type SearchViewProps = {
    readonly q?: string;
    readonly categorySlug?: string;
    readonly pageParam?: string;
    readonly minPriceParam?: string;
    readonly maxPriceParam?: string;
};

export async function SearchView({ q, categorySlug, pageParam, minPriceParam, maxPriceParam }: SearchViewProps) {
    const query = q?.trim() ?? "";
    const minPrice = parsePriceParam(minPriceParam, PRICE_FILTER_MIN);
    const maxPrice = parsePriceParam(maxPriceParam, PRICE_FILTER_MAX);
    const { apiBaseUrl } = getAppConfig();
    const topLevelCategories = getTopLevelCategories(await fetchCategories(apiBaseUrl));

    const requestedPage = resolvePage(pageParam);
    // core-api matches `q` against name, description and variant SKU — there is no separate
    // search endpoint, it is a filter on the same listing call the category page makes.
    const result = query
        ? await fetchProducts(apiBaseUrl, {
              q: query,
              categorySlug,
              ...toPriceFilter(minPrice, maxPrice),
              skip: (requestedPage - 1) * PRODUCTS_PAGE_SIZE,
              limit: PRODUCTS_PAGE_SIZE
          })
        : null;

    const totalPages = Math.max(1, Math.ceil((result?.total ?? 0) / PRODUCTS_PAGE_SIZE));
    const currentPage = Math.min(requestedPage, totalPages);
    const products = result?.products ?? [];

    return (
        <main className="mx-auto w-full max-w-6xl flex-1 px-4 py-10 sm:px-6">
            <h1 className="text-3xl font-semibold tracking-[-0.03em] sm:text-4xl">
                {query ? `Search results for "${query}"` : "Search"}
            </h1>

            <div className="mt-4 flex flex-wrap items-center justify-between gap-4">
                <div className="flex flex-wrap gap-2">
                    <CategoryPill
                        href={buildSearchHref(query, { minPrice, maxPrice })}
                        label="All"
                        active={!categorySlug}
                    />
                    {topLevelCategories.map((category) => (
                        <CategoryPill
                            key={category.id}
                            href={buildSearchHref(query, { category: category.slug, minPrice, maxPrice })}
                            label={category.name}
                            active={categorySlug === category.slug}
                        />
                    ))}
                </div>

                <PriceRangeFilter
                    minPrice={minPrice}
                    maxPrice={maxPrice}
                    basePath="/search"
                    params={{ q: query, category: categorySlug }}
                />
            </div>

            <div className="mt-8 grid grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
                {!query ? (
                    <SearchPrompt />
                ) : products.length > 0 ? (
                    products.map((product) => <ProductCard key={product.id} product={product} />)
                ) : (
                    <NoSearchResults
                        query={query}
                        resetHref={
                            isPriceFiltered(minPrice, maxPrice)
                                ? buildSearchHref(query, { category: categorySlug })
                                : undefined
                        }
                    />
                )}
            </div>

            {totalPages > 1 && query && (
                <ProductPagination
                    currentPage={currentPage}
                    totalPages={totalPages}
                    buildHref={(page) =>
                        buildSearchHref(query, { category: categorySlug, minPrice, maxPrice, page })
                    }
                />
            )}
        </main>
    );
}

// The price bounds default to the slider's ends, which is how a link drops the filter.
function buildSearchHref(
    query: string,
    options: { category?: string; minPrice?: number; maxPrice?: number; page?: number }
): string {
    const { minPrice = PRICE_FILTER_MIN, maxPrice = PRICE_FILTER_MAX } = options;
    const params = new URLSearchParams();
    if (query) {
        params.set("q", query);
    }
    if (options.category) {
        params.set("category", options.category);
    }
    if (minPrice !== PRICE_FILTER_MIN) {
        params.set("minPrice", String(minPrice));
    }
    if (maxPrice !== PRICE_FILTER_MAX) {
        params.set("maxPrice", String(maxPrice));
    }
    if (options.page && options.page > 1) {
        params.set("page", String(options.page));
    }
    const qs = params.toString();
    return `/search${qs ? `?${qs}` : ""}`;
}
