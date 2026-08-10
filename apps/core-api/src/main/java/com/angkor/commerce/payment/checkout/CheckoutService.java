package com.angkor.commerce.payment.checkout;

import com.angkor.commerce.payment.dto.response.PaymentIntentResponse;
import com.angkor.commerce.payment.dto.response.PaymentStatusResponse;

public interface CheckoutService {
    /** Customer taps "Pay" — returns the QR. */

    PaymentIntentResponse startPayment(Long customerId, Long orderId, String provider);

    /** Customer's browser polls this while the QR is on screen. */
    PaymentStatusResponse getPaymentStatus(Long customerId, String reference);

    /**
     * Something told us a payment may have happened — the pushback, or
     * the reconciliation poller. Verify with the gateway, then act.
     * Safe to call any number of times.
     */
    void verifyAndProcess(String reference);
    PaymentStatusResponse confirmWalletPayment(Long customerId, String reference);
}
