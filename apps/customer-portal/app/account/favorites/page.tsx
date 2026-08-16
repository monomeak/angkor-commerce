import { AccountContent } from "@/src/features/account/components/account-content";
import { resolvePage } from "@/src/features/products/lib/pagination-helpers";
import { WishlistBoard } from "@/src/features/wishlist/components/wishlist-board";

type AccountFavoritesPageProps = {
    readonly searchParams: Promise<{ page?: string }>;
};

export default async function AccountFavoritesPage({ searchParams }: AccountFavoritesPageProps) {
    const { page } = await searchParams;

    // Only floored here. The board clamps against the total, which the API sends with the rows.
    return (
        <AccountContent title="My favorites" description="Products you've saved for later.">
            <WishlistBoard page={resolvePage(page)} />
        </AccountContent>
    );
}
