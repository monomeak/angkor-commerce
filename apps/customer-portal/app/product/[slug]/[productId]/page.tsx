import { SiteFooter } from "@/components/layout/site-footer";
import { SiteHeader } from "@/components/layout/site-header";
import { ProductDetailView } from "@/src/features/products/views/product-detail-view";

type ProductDetailPageProps = {
  readonly params: Promise<{ slug: string; productId: string }>;
};

export default async function ProductDetailPage({ params }: ProductDetailPageProps) {
  const { productId } = await params;

  return (
    <div className="flex min-h-full flex-1 flex-col">
      <SiteHeader />

      <ProductDetailView productId={productId} />

      <SiteFooter />
    </div>
  );
}
