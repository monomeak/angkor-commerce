package com.angkor.commerce.payment.impl;

import com.angkor.commerce.common.exception.ResourceNotFoundException;
import com.angkor.commerce.common.exception.ValidationException;
import com.angkor.commerce.invoice.Invoice;
import com.angkor.commerce.invoice.InvoiceRepository;
import com.angkor.commerce.invoice.InvoiceService;
import com.angkor.commerce.invoice.InvoiceStatus;
import com.angkor.commerce.payment.Payment;
import com.angkor.commerce.payment.PaymentRepository;
import com.angkor.commerce.payment.PaymentService;
import com.angkor.commerce.payment.PaymentStatus;
import com.angkor.commerce.payment.dto.request.VoidPaymentRequest;
import com.angkor.commerce.payment.dto.response.PaymentResponse;
import com.angkor.commerce.payment.mapper.PaymentMapper;
import java.time.Instant;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
@Slf4j
public class PaymentServiceImpl implements PaymentService {

    private final PaymentRepository paymentRepository;
    private final InvoiceRepository invoiceRepository;
    private final InvoiceService invoiceService;
    private final PaymentMapper paymentMapper;

    @Override
    public PaymentResponse voidPayment(Long paymentId, VoidPaymentRequest request, Long staffId) {
        Payment payment = paymentRepository
            .findById(paymentId)
            .orElseThrow(() -> new ResourceNotFoundException("Payment " + paymentId + " was not found"));

        if (payment.getPaymentStatus() != PaymentStatus.COMPLETED) {
            throw new ValidationException(
                "Only a completed payment can be voided. This one is " + payment.getPaymentStatus().name().toLowerCase()
            );
        }

        // Lock before changing what the invoice owes
        Invoice invoice = invoiceRepository
            .lockById(payment.getInvoice().getId())
            .orElseThrow(() -> new ResourceNotFoundException("Invoice not found"));

        if (invoice.getInvoiceStatus() == InvoiceStatus.CANCELLED) {
            throw new ValidationException("Payments on a cancelled invoice cannot be voided");
        }

        payment.setPaymentStatus(PaymentStatus.VOIDED);
        payment.setVoidedAt(Instant.now());
        payment.setVoidReason(request.reason());
        payment.setUpdatedBy(staffId);

        invoiceService.refreshPaymentState(invoice);
        invoice.setUpdatedBy(staffId);

        log.warn("Payment {} voided by staff {}: {}", paymentId, staffId, request.reason());

        return paymentMapper.toResponse(payment);
    }
}
