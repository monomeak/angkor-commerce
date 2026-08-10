package com.angkor.commerce.payment.mapper;

import com.angkor.commerce.invoice.Invoice;
import com.angkor.commerce.payment.Payment;
import com.angkor.commerce.payment.dto.response.PaymentResponse;
import com.angkor.commerce.payment.dto.response.PaymentSummaryResponse;
import org.springframework.stereotype.Component;

@Component
public class PaymentMapper {

    public PaymentResponse toResponse(Payment payment) {
        Invoice invoice = payment.getInvoice();
        return new PaymentResponse(
            payment.getId(),
            invoice.getId(),
            invoice.getInvoiceNumber(),
            payment.getAmount(),
            payment.getCurrency(),
            payment.getPaymentMethod(),
            payment.getPaymentStatus(),
            payment.getSource(),
            payment.getPaymentDate(),
            payment.getReferenceNumber(),
            payment.getNotes(),
            payment.getVoidedAt(),
            payment.getVoidReason(),
            payment.getCreatedAt()
        );
    }

    public PaymentSummaryResponse toSummary(Payment payment) {
        return new PaymentSummaryResponse(
            payment.getId(),
            payment.getAmount(),
            payment.getPaymentMethod(),
            payment.getPaymentStatus(),
            payment.getSource(),
            payment.getPaymentDate(),
            payment.getReferenceNumber()
        );
    }
}
