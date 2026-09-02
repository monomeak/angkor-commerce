import { Suspense } from "react";
import { CustomersTableSkeleton } from "@/src/features/customers/components/customers-table-skeleton";
import { CustomersListView } from "@/src/features/customers/views/customers-list-view";

/**
 * The route stays thin and the view holds the logic (AGENTS.md). The Suspense boundary is
 * required, not decorative: CustomersListView reads useSearchParams(), and Next opts the
 * whole route into client-side rendering without one.
 */
export default function CustomersPage() {
    return (
        <Suspense fallback={<CustomersTableSkeleton />}>
            <CustomersListView />
        </Suspense>
    );
}
