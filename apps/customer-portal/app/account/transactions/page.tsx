import { AccountContent } from "@/src/features/account/components/account-content";
import { resolvePage } from "@/src/features/products/lib/pagination-helpers";
import { WalletTransactions } from "@/src/features/wallet/components/wallet-transactions";
import { WalletBalanceCard } from "@/src/features/wallet/components/wallet-balance-card";

/**
 * Wallets are per currency and the storefront only transacts in one — the catalogue's, which
 * core-api defaults to USD. A second currency would need a picker here.
 */
const WALLET_CURRENCY = "USD";

type AccountTransactionsPageProps = {
    readonly searchParams: Promise<{ page?: string }>;
};

export default async function AccountTransactionsPage({ searchParams }: AccountTransactionsPageProps) {
    const { page } = await searchParams;

    return (
        <AccountContent title="My wallet" description="Your balance and everything it has paid for.">
            <div className="flex flex-col gap-6">
                <WalletBalanceCard currency={WALLET_CURRENCY} />
                <WalletTransactions currency={WALLET_CURRENCY} page={resolvePage(page)} />
            </div>
        </AccountContent>
    );
}
