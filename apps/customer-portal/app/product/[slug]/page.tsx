import Link from "next/link";
import { notFound } from "next/navigation";

import { SiteFooter } from "@/components/layout/site-footer";
import { SiteHeader } from "@/components/layout/site-header";
import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";
import {
  getCategoryById,
  getCategoryBySlug,
  getChildCategories,
} from "@/src/features/categories/lib/category-helpers";
import { fetchProducts } from "@/src/features/products/api/product-api";
import { ProductCard } from "@/src/features/products/components/product-card";

const PAGE_SIZE = 8;

type CategoryPageProps = {
  readonly params: Promise<{ slug: string }>;
  readonly searchParams: Promise<{ category?: string; page?: string }>;
};

export default async function CategoryPage({ params, searchParams }: CategoryPageProps) {
  const { slug } = await params;
  const { category: categoryParam, page: pageParam } = await searchParams;
  const category = getCategoryBySlug(slug);

  if (!category) {
    notFound();
  }

  const parent = category.parentId ? getCategoryById(category.parentId) : null;
  const children = getChildCategories(category.id);
  const activeChild =
    categoryParam && categoryParam !== "all"
      ? children.find((child) => child.slug === categoryParam)
      : undefined;
  const allProducts = await fetchProducts({ categorySlug: activeChild?.slug ?? slug });

  const totalPages = Math.max(1, Math.ceil(allProducts.length / PAGE_SIZE));
  const requestedPage = Number(pageParam);
  const currentPage = Math.min(
    Math.max(Number.isFinite(requestedPage) ? Math.trunc(requestedPage) : 1, 1),
    totalPages,
  );
  const start = (currentPage - 1) * PAGE_SIZE;
  const products = allProducts.slice(start, start + PAGE_SIZE);

  return (
    <div className="flex min-h-full flex-1 flex-col">
      <SiteHeader />

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

        <h1 className="mt-2 text-3xl font-semibold tracking-[-0.03em] sm:text-4xl">
          {category.name}
        </h1>

        {children.length > 0 && (
          <div className="mt-4 flex flex-wrap gap-2">
            <CategoryPill href={`/product/${slug}`} label="All" active={!activeChild} />
            {children.map((child) => (
              <CategoryPill
                key={child.id}
                href={`/product/${slug}?category=${child.slug}`}
                label={child.name}
                active={activeChild?.id === child.id}
              />
            ))}
          </div>
        )}

        <div className="mt-8 grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
          {products.length > 0 ? (
            products.map((product) => <ProductCard key={product.id} product={product} />)
          ) : (
            <p className="col-span-full text-sm text-muted-foreground">
              No products in this category yet.
            </p>
          )}
        </div>

        {totalPages > 1 && (
          <ProductPagination
            slug={slug}
            categoryParam={activeChild?.slug}
            currentPage={currentPage}
            totalPages={totalPages}
          />
        )}
      </main>

      <SiteFooter />
    </div>
  );
}

function buildPageHref(slug: string, categoryParam: string | undefined, page: number): string {
  const params = new URLSearchParams();
  if (categoryParam) {
    params.set("category", categoryParam);
  }
  if (page > 1) {
    params.set("page", String(page));
  }
  const query = params.toString();
  return `/product/${slug}${query ? `?${query}` : ""}`;
}

// Collapses a long page run into first/last + a window around the current
// page, e.g. [1, "ellipsis", 4, 5, 6, "ellipsis", 20].
function getPageRange(currentPage: number, totalPages: number): (number | "ellipsis")[] {
  const delta = 1;
  const pages: number[] = [];

  for (let page = 1; page <= totalPages; page += 1) {
    if (page === 1 || page === totalPages || Math.abs(page - currentPage) <= delta) {
      pages.push(page);
    }
  }

  const range: (number | "ellipsis")[] = [];
  let previous = 0;
  for (const page of pages) {
    if (previous && page - previous > 1) {
      range.push("ellipsis");
    }
    range.push(page);
    previous = page;
  }

  return range;
}

function ProductPagination({
  slug,
  categoryParam,
  currentPage,
  totalPages,
}: {
  slug: string;
  categoryParam: string | undefined;
  currentPage: number;
  totalPages: number;
}) {
  const pageRange = getPageRange(currentPage, totalPages);
  const isFirstPage = currentPage <= 1;
  const isLastPage = currentPage >= totalPages;

  return (
    <Pagination className="mt-8">
      <PaginationContent>
        <PaginationItem>
          <PaginationPrevious
            href={buildPageHref(slug, categoryParam, Math.max(currentPage - 1, 1))}
            aria-disabled={isFirstPage}
            tabIndex={isFirstPage ? -1 : undefined}
            className={isFirstPage ? "pointer-events-none opacity-50" : undefined}
          />
        </PaginationItem>
        {pageRange.map((page, index) =>
          page === "ellipsis" ? (
            <PaginationItem key={`ellipsis-${index}`}>
              <PaginationEllipsis />
            </PaginationItem>
          ) : (
            <PaginationItem key={page}>
              <PaginationLink
                href={buildPageHref(slug, categoryParam, page)}
                isActive={page === currentPage}
              >
                {page}
              </PaginationLink>
            </PaginationItem>
          ),
        )}
        <PaginationItem>
          <PaginationNext
            href={buildPageHref(slug, categoryParam, Math.min(currentPage + 1, totalPages))}
            aria-disabled={isLastPage}
            tabIndex={isLastPage ? -1 : undefined}
            className={isLastPage ? "pointer-events-none opacity-50" : undefined}
          />
        </PaginationItem>
      </PaginationContent>
    </Pagination>
  );
}

function CategoryPill({
  href,
  label,
  active,
}: {
  href: string;
  label: string;
  active: boolean;
}) {
  return (
    <Link
      href={href}
      className={
        active
          ? "rounded-full border border-primary bg-primary/10 px-3 py-1 text-sm font-medium text-foreground"
          : "rounded-full border px-3 py-1 text-sm text-muted-foreground transition-colors hover:border-primary hover:text-foreground"
      }
    >
      {label}
    </Link>
  );
}
