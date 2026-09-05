export const walletKeys = {
    all: ["wallet"] as const,
    /** Per currency: a customer can hold one wallet per currency, and they are separate balances. */
    balance: (currency: string) => [...walletKeys.all, "balance", currency] as const,
    transactions: (currency: string, page: number) =>
        [...walletKeys.all, "transactions", currency, page] as const
};
