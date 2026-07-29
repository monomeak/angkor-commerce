import Link from "next/link";
import { notFound } from "next/navigation";

import { SiteFooter } from "@/components/layout/site-footer";
import { SiteHeader } from "@/components/layout/site-header";
import {
  getCategoryById,
  getCategoryBySlug,
  getChildCategories,
} from "@/src/features/categories/lib/category-helpers";
import { fetchProducts } from "@/src/features/products/api/product-api";
import { ProductCard } from "@/src/features/products/components/product-card";

type CategoryPageProps = {
  readonly params: Promise<{ slug: string }>;
};

export default async function CategoryPage({ params }: CategoryPageProps) {
  const { slug } = await params;
  const category = getCategoryBySlug(slug);

  if (!category) {
    notFound();
  }

  const parent = category.parentId ? getCategoryById(category.parentId) : null;
  const children = getChildCategories(category.id);
  const products = await fetchProducts({ categorySlug: slug });

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
            {children.map((child) => (
              <Link
                key={child.id}
                href={`/product/${child.slug}`}
                className="rounded-full border px-3 py-1 text-sm text-muted-foreground transition-colors hover:border-primary hover:text-foreground"
              >
                {child.name}
              </Link>
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
      </main>

      <SiteFooter />
    </div>
  );
}
