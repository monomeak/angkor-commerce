package com.angkor.commerce.payment.gateway.aba;

import java.util.Arrays;
import java.util.List;

public record AbaQrRequest(
    String reqTime, // yyyyMMddHHmmss, UTC
    String merchantId,
    String tranId, // our reference, ≤ 20 chars
    String amount, // "27.50" for USD, "5000" for KHR
    String items, // Base64-encoded JSON array, max 10 entries
    String firstName,
    String lastName,
    String email,
    String phone,
    String purchaseType, // "purchase"
    String paymentOption, // "abapay_khqr"
    String callbackUrl, // Base64-encoded pushback URL
    String returnDeeplink,
    String currency, // "USD" or "KHR"
    String customFields,
    String returnParams,
    String payout,
    String lifetime, // minutes, as a string
    String qrImageTemplate
) {
    public List<String> hashOrder() {
        return Arrays.asList(
            reqTime,
            merchantId,
            tranId,
            amount,
            items,
            firstName,
            lastName,
            email,
            phone,
            purchaseType,
            paymentOption,
            callbackUrl,
            returnDeeplink,
            currency,
            customFields,
            returnParams,
            payout,
            lifetime,
            qrImageTemplate
        );
    }
}
