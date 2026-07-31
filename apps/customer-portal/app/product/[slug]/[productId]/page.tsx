import Link from "next/link";
import { notFound } from "next/navigation";

import { SiteFooter } from "@/components/layout/site-footer";
import { SiteHeader } from "@/components/layout/site-header";
import { getCategoryById } from "@/src/features/categories/lib/category-helpers";
import { fetchProductById, fetchProducts } from "@/src/features/products/api/product-api";
import { ProductCard } from "@/src/features/products/components/product-card";
import { ProductDetail } from "@/src/features/products/components/product-detail";

type ProductDetailPageProps = {
  readonly params: Promise<{ slug: string; productId: string }>;
};

export default async function ProductDetailPage({ params }: ProductDetailPageProps) {
  const { productId } = await params;
  const id = Number(productId);

  if (!Number.isInteger(id)) {
    notFound();
  }

  const product = await fetchProductById(id);

  if (!product) {
    notFound();
  }

  const category = getCategoryById(product.categoryId);
  const parent = category?.parentId ? getCategoryById(category.parentId) : null;

  const related = category
    ? (await fetchProducts({ categorySlug: category.slug }))
        .filter((item) => item.id !== product.id)
        .slice(0, 4)
    : [];

  const broaderCategory = parent ?? category;
  const excludedIds = new Set([product.id, ...related.map((item) => item.id)]);
  const otherProducts = broaderCategory
    ? (await fetchProducts({ categorySlug: broaderCategory.slug }))
        .filter((item) => !excludedIds.has(item.id))
        .slice(0, 4)
    : [];

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
          {category && (
            <>
              {" / "}
              <Link href={`/product/${category.slug}`} className="hover:text-foreground">
                {category.name}
              </Link>
            </>
          )}
          {" / "}
          <span className="text-foreground">{product.name}</span>
        </nav>

        <ProductDetail product={product} categoryName={category?.name ?? ""} />

        {related.length > 0 && (
          <section className="mt-16">
            <h2 className="text-2xl font-semibold tracking-[-0.03em]">You might also like</h2>
            <div className="mt-6 grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
              {related.map((item) => (
                <ProductCard key={item.id} product={item} />
              ))}
            </div>
          </section>
        )}

        {otherProducts.length > 0 && (
          <section className="mt-16">
            <h2 className="text-2xl font-semibold tracking-[-0.03em]">Other products you may like</h2>
            <div className="mt-6 grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
              {otherProducts.map((item) => (
                <ProductCard key={item.id} product={item} />
              ))}
            </div>
          </section>
        )}
      </main>

      <SiteFooter />
    </div>
  );
}
