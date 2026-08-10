package com.angkor.commerce.payment;

import com.angkor.commerce.payment.dto.request.VoidPaymentRequest;
import com.angkor.commerce.payment.dto.response.PaymentResponse;

public interface PaymentService {
    PaymentResponse voidPayment(Long paymentId, VoidPaymentRequest request, Long staffId);
}
