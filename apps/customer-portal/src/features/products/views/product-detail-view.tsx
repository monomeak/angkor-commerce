import Link from "next/link";
import { notFound } from "next/navigation";

import { getAppConfig } from "@/lib/app-config.server";
import { fetchCategories } from "@/src/features/categories/api/category-api";
import { getCategoryById } from "@/src/features/categories/lib/category-helpers";
import { fetchProducts, findProduct } from "../api/product-api";
import { ProductCard } from "../components/product-card";
import { ProductDetail } from "../components/product-detail";

type ProductDetailViewProps = {
    readonly productId: string;
};

/** How many products to show in each "you might also like" row. */
const SUGGESTION_COUNT = 4;

export async function ProductDetailView({ productId }: ProductDetailViewProps) {
    const id = Number(productId);

    if (!Number.isInteger(id)) {
        notFound();
    }

    const { apiBaseUrl } = getAppConfig();
    const product = await findProduct(apiBaseUrl, id);

    if (!product) {
        notFound();
    }

    /*
     * The route's [slug] segment is not trusted for the breadcrumb — the product's own
     * category is. A stale or hand-edited slug then shows the right trail instead of a
     * mismatched one, and the page stays valid at whatever URL it was reached from.
     */
    const categories = await fetchCategories(apiBaseUrl);
    const category = product.category;
    const parent = category ? getCategoryById(categories, category.id)?.parentId : null;
    const parentCategory = parent ? getCategoryById(categories, parent) : null;

    // Two rows: same category first, then the wider parent category. Both are fetched a page
    // deep because the product itself has to be filtered out of them.
    const [related, broader] = await Promise.all([
        category
            ? fetchProducts(apiBaseUrl, { categorySlug: category.slug, limit: SUGGESTION_COUNT + 1 })
            : Promise.resolve(null),
        parentCategory
            ? fetchProducts(apiBaseUrl, { categorySlug: parentCategory.slug, limit: SUGGESTION_COUNT * 3 })
            : Promise.resolve(null)
    ]);

    const relatedProducts = (related?.products ?? [])
        .filter((item) => item.id !== product.id)
        .slice(0, SUGGESTION_COUNT);

    const shownIds = new Set([product.id, ...relatedProducts.map((item) => item.id)]);
    const otherProducts = (broader?.products ?? [])
        .filter((item) => !shownIds.has(item.id))
        .slice(0, SUGGESTION_COUNT);

    return (
        <main className="mx-auto w-full max-w-6xl flex-1 px-4 py-10 sm:px-6">
            <nav className="text-sm text-muted-foreground" aria-label="Breadcrumb">
                <Link href="/" className="hover:text-foreground">
                    Home
                </Link>
                {parentCategory && (
                    <>
                        {" / "}
                        <Link href={`/product/${parentCategory.slug}`} className="hover:text-foreground">
                            {parentCategory.name}
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

            <ProductDetail product={product} />

            {relatedProducts.length > 0 && (
                <section className="mt-16">
                    <h2 className="text-2xl font-semibold tracking-[-0.03em]">You might also like</h2>
                    <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
                        {relatedProducts.map((item) => (
                            <ProductCard key={item.id} product={item} />
                        ))}
                    </div>
                </section>
            )}

            {otherProducts.length > 0 && (
                <section className="mt-16">
                    <h2 className="text-2xl font-semibold tracking-[-0.03em]">Other products you may like</h2>
                    <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
                        {otherProducts.map((item) => (
                            <ProductCard key={item.id} product={item} />
                        ))}
                    </div>
                </section>
            )}
        </main>
    );
}
