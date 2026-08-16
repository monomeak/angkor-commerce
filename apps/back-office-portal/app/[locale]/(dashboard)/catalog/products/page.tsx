import { Suspense } from "react";
import { ProductsView } from "@/src/features/catalog/products/views/products-view";
import { ProductTableSkeleton } from "@/src/features/catalog/products/components/product-table-skeleton";

/**
 * The route stays thin and the view holds the logic (AGENTS.md). The Suspense boundary is
 * required, not decorative: ProductsView reads useSearchParams(), and Next opts the whole
 * route into client-side rendering without one.
 */
export default function ProductsPage() {
    return (
        <Suspense fallback={<ProductTableSkeleton />}>
            <ProductsView />
        </Suspense>
    );
}
