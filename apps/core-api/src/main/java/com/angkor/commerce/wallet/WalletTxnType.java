package com.angkor.commerce.wallet;

public enum WalletTxnType {
    TOPUP, // customer added money
    PURCHASE, // spent on an order
    REFUND, // money returned
    ADJUSTMENT, // staff correction
    REVERSAL, // undoing a prior transaction
    SEED // dev/demo only
}
