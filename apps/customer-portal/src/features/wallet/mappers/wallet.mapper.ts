import type { WalletDto, WalletTransactionDto, WalletTransactionPageDto } from "../schemas/wallet-api.schema";
import type { Wallet, WalletTransaction, WalletTransactionPage } from "../types/wallet";

export function mapWallet(dto: WalletDto): Wallet {
    return {
        id: dto.id,
        customerId: dto.customerId,
        currency: dto.currency,
        balance: dto.balance,
        heldAmount: dto.heldAmount,
        availableBalance: dto.availableBalance,
        status: dto.status,
        lastTransactionAt: dto.lastTransactionAt
    };
}

/** `createdBy` is dropped: it names the staff member behind a manual credit, which is back-office detail. */
export function mapWalletTransaction(dto: WalletTransactionDto): WalletTransaction {
    return {
        id: dto.id,
        type: dto.type,
        direction: dto.direction,
        amount: dto.amount,
        currency: dto.currency,
        balanceAfter: dto.balanceAfter,
        orderId: dto.orderId,
        description: dto.description,
        createdAt: dto.createdAt
    };
}

export function mapWalletTransactionPage(dto: WalletTransactionPageDto): WalletTransactionPage {
    return {
        items: dto.transactions.map(mapWalletTransaction),
        total: dto.total,
        skip: dto.skip,
        limit: dto.limit
    };
}
