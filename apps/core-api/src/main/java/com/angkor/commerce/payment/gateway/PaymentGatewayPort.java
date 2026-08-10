package com.angkor.commerce.payment.gateway;

import com.angkor.commerce.payment.PaymentMethod;

public interface PaymentGatewayPort {
    /** ABA_PAYWAY, WALLET, MOCK — routes callbacks and /pay requests. */
    String providerCode();

    /**
     * Ask the gateway to prepare a payment. Returns what the customer
     * needs in order to pay — for ABA, a KHQR string and a deeplink.
     */
    GatewayIntent createIntent(GatewayIntentRequest request);
    GatewayStatusResult checkStatus(String reference);

    default PaymentMethod paymentMethod() {
        return PaymentMethod.OTHER;
    }

}
