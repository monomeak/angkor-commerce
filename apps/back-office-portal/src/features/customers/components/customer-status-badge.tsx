import { Badge } from "@/components/ui/badge";
import type { CustomerStatus } from "../types/customer";

const STATUS_VARIANTS: Record<CustomerStatus, "default" | "secondary" | "outline"> = {
    active: "default",
    inactive: "secondary",
    // "deleted" is the API's word for it; the back office calls it archived, because
    // nothing was actually deleted — same wording as the catalogue.
    deleted: "outline"
};

type CustomerStatusBadgeProps = {
    readonly status: CustomerStatus;
    readonly label: string;
};

export function CustomerStatusBadge({ status, label }: CustomerStatusBadgeProps) {
    return (
        <Badge variant={STATUS_VARIANTS[status]} className={status === "deleted" ? "text-muted-foreground" : undefined}>
            {label}
        </Badge>
    );
}
