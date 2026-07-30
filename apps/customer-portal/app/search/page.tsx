import { SiteFooter } from "@/components/layout/site-footer";
import { SiteHeader } from "@/components/layout/site-header";
import { CategoryPill } from "@/src/features/categories/components/category-pill";
import { getTopLevelCategories } from "@/src/features/categories/lib/category-helpers";
import { fetchProducts } from "@/src/features/products/api/product-api";
import { ProductCard } from "@/src/features/products/components/product-card";
import { ProductPagination } from "@/src/features/products/components/product-pagination";
import { PriceRangeFilter } from "@/src/features/products/components/price-range-filter";
import { resolvePage } from "@/src/features/products/lib/pagination-helpers";
import { PRICE_FILTER_MAX, PRICE_FILTER_MIN, parsePriceParam } from "@/src/features/products/lib/price-filter";

const PAGE_SIZE = 8;

type SearchPageProps = {
  readonly searchParams: Promise<{
    q?: string;
    category?: string;
    page?: string;
    minPrice?: string;
    maxPrice?: string;
  }>;
};

export default async function SearchPage({ searchParams }: SearchPageProps) {
  const {
    q,
    category: categorySlug,
    page: pageParam,
    minPrice: minPriceParam,
    maxPrice: maxPriceParam,
  } = await searchParams;
  const query = q?.trim() ?? "";
  const minPrice = parsePriceParam(minPriceParam, PRICE_FILTER_MIN);
  const maxPrice = parsePriceParam(maxPriceParam, PRICE_FILTER_MAX);
  const topLevelCategories = getTopLevelCategories();

  const allProducts = query
    ? await fetchProducts({ query, categorySlug, minPrice, maxPrice })
    : [];

  const totalPages = Math.max(1, Math.ceil(allProducts.length / PAGE_SIZE));
  const currentPage = resolvePage(pageParam, totalPages);
  const start = (currentPage - 1) * PAGE_SIZE;
  const products = allProducts.slice(start, start + PAGE_SIZE);

  return (
    <div className="flex min-h-full flex-1 flex-col">
      <SiteHeader />

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

        <div className="mt-8 grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
          {!query ? (
            <p className="col-span-full text-sm text-muted-foreground">
              Enter a search term to find products.
            </p>
          ) : products.length > 0 ? (
            products.map((product) => <ProductCard key={product.id} product={product} />)
          ) : (
            <p className="col-span-full text-sm text-muted-foreground">
              No products found for &quot;{query}&quot;.
            </p>
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

      <SiteFooter />
    </div>
  );
}

function buildSearchHref(
  query: string,
  options: { category?: string; minPrice: number; maxPrice: number; page?: number },
): string {
  const params = new URLSearchParams();
  if (query) {
    params.set("q", query);
  }
  if (options.category) {
    params.set("category", options.category);
  }
  if (options.minPrice !== PRICE_FILTER_MIN) {
    params.set("minPrice", String(options.minPrice));
  }
  if (options.maxPrice !== PRICE_FILTER_MAX) {
    params.set("maxPrice", String(options.maxPrice));
  }
  if (options.page && options.page > 1) {
    params.set("page", String(options.page));
  }
  const qs = params.toString();
  return `/search${qs ? `?${qs}` : ""}`;
}
