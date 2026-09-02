import { cn } from "@/lib/utils";
import { displayStatus, STATUS_STYLES } from "../lib/invoice-display";
import type { InvoiceStatus } from "../types/invoice";

interface InvoiceStatusBadgeProps {
    readonly status: InvoiceStatus;
    /** Both needed to tell "unpaid" from "overdue" — the API has no OVERDUE status. */
    readonly dueDate: string;
    readonly balance: number;
    readonly labels: Record<string, string>;
    readonly className?: string;
}

export function InvoiceStatusBadge({ status, dueDate, balance, labels, className }: InvoiceStatusBadgeProps) {
    const derived = displayStatus(status, dueDate, balance);

    return (
        <span
            className={cn(
                "inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium",
                STATUS_STYLES[derived],
                className
            )}
        >
            {labels[derived]}
        </span>
    );
}
