import { Badge } from "@/components/ui/badge";
import type { ProductStatus } from "../types/product";

const STATUS_LABELS: Record<ProductStatus, string> = {
    active: "Active",
    inactive: "Inactive",
    // "deleted" is the API's word for it; the back office calls it archived, because
    // nothing was actually deleted and the product can be restored.
    deleted: "Archived"
};

const STATUS_VARIANTS: Record<ProductStatus, "default" | "secondary" | "outline"> = {
    active: "default",
    inactive: "secondary",
    deleted: "outline"
};

export function ProductStatusBadge({ status }: { readonly status: ProductStatus }) {
    return (
        <Badge variant={STATUS_VARIANTS[status]} className={status === "deleted" ? "text-muted-foreground" : undefined}>
            {STATUS_LABELS[status]}
        </Badge>
    );
}
