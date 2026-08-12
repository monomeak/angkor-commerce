import { notFound } from "next/navigation";
import { ProductEditView } from "@/src/features/catalog/products/views/product-edit-view";

type EditProductPageProps = {
    readonly params: Promise<{ id: string }>;
};

export default async function EditProductPage({ params }: EditProductPageProps) {
    const { id } = await params;
    const productId = Number(id);

    // A non-numeric id can never match a record, so fail here rather than sending the API
    // a request it will reject.
    if (!Number.isInteger(productId) || productId <= 0) {
        notFound();
    }

    return <ProductEditView productId={productId} />;
}
