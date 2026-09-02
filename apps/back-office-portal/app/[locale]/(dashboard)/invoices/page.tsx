import { Suspense } from "react";
import { InvoicesTableSkeleton } from "@/src/features/invoices/components/invoices-table-skeleton";
import { InvoicesListView } from "@/src/features/invoices/views/invoices-list-view";

/**
 * The route stays thin and the view holds the logic (AGENTS.md). The Suspense boundary is
 * required, not decorative: InvoicesListView reads useSearchParams(), and Next opts the whole
 * route into client-side rendering without one.
 */
export default function InvoicesPage() {
    return (
        <Suspense fallback={<InvoicesTableSkeleton />}>
            <InvoicesListView />
        </Suspense>
    );
}
