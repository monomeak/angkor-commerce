import { SiteFooter } from "@/components/layout/site-footer";
import { SiteHeader } from "@/components/layout/site-header";
import { SearchView } from "@/src/features/products/views/search-view";

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
  const { q, category, page, minPrice, maxPrice } = await searchParams;

  return (
    <div className="flex min-h-full flex-1 flex-col">
      <SiteHeader />

      <SearchView
        q={q}
        categorySlug={category}
        pageParam={page}
        minPriceParam={minPrice}
        maxPriceParam={maxPrice}
      />

      <SiteFooter />
    </div>
  );
}
