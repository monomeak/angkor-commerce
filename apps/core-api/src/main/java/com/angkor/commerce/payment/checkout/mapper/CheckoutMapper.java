package com.angkor.commerce.payment.checkout.mapper;

import com.angkor.commerce.common.enums.RecordStatus;
import com.angkor.commerce.invoice.Invoice;
import com.angkor.commerce.invoice.InvoiceRepository;
import com.angkor.commerce.order.Order;
import com.angkor.commerce.order.OrderRepository;
import com.angkor.commerce.payment.dto.response.PaymentIntentResponse;
import com.angkor.commerce.payment.dto.response.PaymentStatusResponse;
import com.angkor.commerce.payment.intent.IntentStatus;
import com.angkor.commerce.payment.intent.PaymentIntent;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Component;

@Component
@RequiredArgsConstructor
public class CheckoutMapper {

    private final OrderRepository orderRepository;
    private final InvoiceRepository invoiceRepository;

    public PaymentIntentResponse toIntentResponse(PaymentIntent intent) {
        return new PaymentIntentResponse(
            intent.getReference(),
            intent.getProvider(),
            intent.getAmount(),
            intent.getCurrency(),
            intent.getIntentStatus(),
            intent.getQrPayload(),
            intent.getDeeplink(),
            intent.getExpiresAt()
        );
    }

    public PaymentStatusResponse toStatusResponse(PaymentIntent intent) {
        String orderNumber = orderRepository.findById(intent.getOrderId()).map(Order::getOrderNumber).orElse(null);

        // Only look for an invoice once the payment actually succeeded
        String invoiceNumber =
            intent.getIntentStatus() == IntentStatus.SUCCEEDED
                ? invoiceRepository
                      .findByOrderIdAndStatusNot(intent.getOrderId(), RecordStatus.DELETED)
                      .map(Invoice::getInvoiceNumber)
                      .orElse(null)
                : null;

        return new PaymentStatusResponse(
            intent.getReference(),
            intent.getIntentStatus(),
            orderNumber,
            invoiceNumber,
            intent.getConfirmedAt(),
            intent.getFailureReason()
        );
    }
}
