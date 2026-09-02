import { AccountContent } from "@/src/features/account/components/account-content";
import { OrdersList } from "@/src/features/orders/components/orders-list";
import { resolvePage } from "@/src/features/products/lib/pagination-helpers";

type AccountOrdersPageProps = {
    readonly searchParams: Promise<{ page?: string }>;
};

export default async function AccountOrdersPage({ searchParams }: AccountOrdersPageProps) {
    const { page } = await searchParams;

    return (
        <AccountContent title="My orders" description="Track and review your past orders.">
            <OrdersList page={resolvePage(page)} />
        </AccountContent>
    );
}
