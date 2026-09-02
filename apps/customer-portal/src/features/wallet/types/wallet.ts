/**
 * The customer's stored balance — core-api's DEV_WALLET provider. It is a real double-entry
 * ledger (`wallet_transactions`, one row per movement, each carrying the balance it left
 * behind), not a number the client is trusted to keep.
 *
 * `heldAmount` is reserved by pending payment intents; nothing writes it yet, so it is
 * always zero and `availableBalance` equals `balance`.
 */
export type WalletStatus = "ACTIVE" | "FROZEN" | "CLOSED";
export type WalletTxnType = "TOPUP" | "PURCHASE" | "REFUND" | "ADJUSTMENT" | "REVERSAL" | "SEED";
export type TxnDirection = "CREDIT" | "DEBIT";

export type Wallet = {
    /** Null until the first transaction creates the row. */
    id: number | null;
    customerId: number;
    currency: string;
    balance: number;
    heldAmount: number;
    availableBalance: number;
    status: WalletStatus;
    lastTransactionAt: string | null;
};

export type WalletTransaction = {
    id: number;
    type: WalletTxnType;
    direction: TxnDirection;
    /** Always positive; `direction` carries the sign. */
    amount: number;
    currency: string;
    balanceAfter: number;
    orderId: number | null;
    description: string | null;
    createdAt: string;
};

export type WalletTransactionPage = {
    items: WalletTransaction[];
    total: number;
    skip: number;
    limit: number;
};
