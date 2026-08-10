package com.angkor.commerce.payment.checkout.impl;

import java.security.SecureRandom;
import java.time.Duration;
import java.time.Instant;
import java.time.LocalDate;
import java.time.ZoneId;
import java.time.ZoneOffset;
import java.time.format.DateTimeFormatter;
import java.util.Optional;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.angkor.commerce.common.exception.ResourceNotFoundException;
import com.angkor.commerce.common.exception.ValidationException;
import com.angkor.commerce.invoice.Invoice;
import com.angkor.commerce.invoice.InvoiceService;
import com.angkor.commerce.order.Order;
import com.angkor.commerce.order.OrderRepository;
import com.angkor.commerce.order.OrderStatus;
import com.angkor.commerce.payment.Payment;
import com.angkor.commerce.payment.PaymentRepository;
import com.angkor.commerce.payment.PaymentSource;
import com.angkor.commerce.payment.PaymentStatus;
import com.angkor.commerce.payment.checkout.CheckoutService;
import com.angkor.commerce.payment.checkout.mapper.CheckoutMapper;
import com.angkor.commerce.payment.dto.response.PaymentIntentResponse;
import com.angkor.commerce.payment.dto.response.PaymentStatusResponse;
import com.angkor.commerce.payment.gateway.GatewayIntent;
import com.angkor.commerce.payment.gateway.GatewayIntentRequest;
import com.angkor.commerce.payment.gateway.GatewayStatusResult;
import com.angkor.commerce.payment.gateway.PaymentGatewayPort;
import com.angkor.commerce.payment.gateway.PaymentGatewayResolver;
import com.angkor.commerce.payment.intent.IntentStatus;
import com.angkor.commerce.payment.intent.PaymentIntent;
import com.angkor.commerce.payment.intent.PaymentIntentRepository;
import com.angkor.commerce.wallet.WalletPaymentGatewayAdapter;
import com.angkor.commerce.wallet.WalletService;
import com.angkor.commerce.wallet.WalletTxnType;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

@Service
@RequiredArgsConstructor
@Slf4j
@Transactional(readOnly = true)
public class CheckoutServiceImpl implements CheckoutService {

    private final PaymentIntentRepository intentRepository;
    private final OrderRepository orderRepository;
    private final PaymentRepository paymentRepository;
    private final InvoiceService invoiceService;
    private final PaymentGatewayResolver gatewayResolver;
    private final CheckoutMapper checkoutMapper;
    private final WalletService walletService;

    @Value("${angkor.payment.default-provider:ABA_PAYWAY}")
    private String defaultProvider;

    private static final ZoneId ZONE = ZoneId.of("Asia/Phnom_Penh");
    private static final SecureRandom RANDOM = new SecureRandom();
    private static final String ALPHANUMERIC = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789"; // no 0/O/1/I lookalikes

    /** Backstop for intents the gateway never gives a straight answer about. */
    private static final int MAX_POLL_ATTEMPTS = 60;

    @Override
    @Transactional
    public PaymentIntentResponse startPayment(Long customerId, Long orderId, String provider) {
        Order order = orderRepository
            .findByIdAndCustomerId(orderId, customerId)
            .orElseThrow(() -> new ResourceNotFoundException("Order " + orderId + " was not found"));

        if (order.getStatus() != OrderStatus.PENDING) {
            throw new ValidationException(
                "Order %s is %s and cannot be paid".formatted(
                    order.getOrderNumber(),
                    order.getStatus().name().toLowerCase()
                )
            );
        }

        // The customer refreshed the page

        Optional<PaymentIntent> live = intentRepository.findLiveByOrderId(orderId);

        if (live.isPresent() && !live.get().isExpired()) {
            return checkoutMapper.toIntentResponse(live.get());
        }
        live.ifPresent(i -> i.setIntentStatus(IntentStatus.EXPIRED));

        PaymentGatewayPort gateway = gatewayResolver.resolve(provider != null ? provider : defaultProvider);

        PaymentIntent intent = new PaymentIntent();
        intent.setReference(newReference());
        intent.setOrderId(order.getId());
        intent.setProvider(gateway.providerCode());
        intent.setAmount(order.getTotal());
        intent.setCurrency(order.getCurrency());
        intent.setIntentStatus(IntentStatus.CREATED);

        // ── Save BEFORE calling PayWay ──
        // If the call below times out but PayWay actually created the
        // transaction, this row is how the poller finds and recovers it.
        // Reverse the order and a timeout leaves real money attached to
        // nothing in your database.

        intent = intentRepository.saveAndFlush(intent);

        GatewayIntent created = gateway.createIntent(
            new GatewayIntentRequest(
                intent.getReference(),
                intent.getAmount(),
                intent.getCurrency(),
                "Order " + order.getOrderNumber(),
                order.getShippingFullName(),
                order.getShippingAddress(),
                Duration.ofMinutes(15)
            )
        );

        intent.setQrPayload(created.qrPayload());
        intent.setDeeplink(created.deeplink());
        intent.setExpiresAt(created.expiresAt());
        intent.setIntentStatus(IntentStatus.PENDING);

        return checkoutMapper.toIntentResponse(intent);
    }

    @Override
    public PaymentStatusResponse getPaymentStatus(Long customerId, String reference) {
        PaymentIntent intent = intentRepository
            .findByReferenceForCustomer(reference, customerId)
            .orElseThrow(() -> new ResourceNotFoundException("Payment " + reference + " was not found"));
        return checkoutMapper.toStatusResponse(intent);
    }

    /**
     * Read-write on purpose: this writes an invoice, a payment and an order
     * transition. Without it the class-level readOnly=true leaves Hibernate in
     * FlushMode.MANUAL and every confirmation from the pushback or the poller
     * is silently discarded.
     */
    @Override
    @Transactional
    public void verifyAndProcess(String reference) {
        // Lock first. The pushback and the poller can both arrive here
        // at the same moment; the lock serialises them, and whichever
        // comes second sees a terminal status and stops.

        PaymentIntent intent = intentRepository
            .lockByReference(reference)
            .orElseThrow(() -> new ResourceNotFoundException("Payment intent " + reference + " was not found"));

        if (intent.getIntentStatus().isTerminal()) {
            log.info("Intent {} already {} — nothing to do", reference, intent.getIntentStatus());

            return;
        }
        // Ask PayWay. THIS is the trusted answer.
        PaymentGatewayPort gateway = gatewayResolver.resolve(intent.getProvider());
        GatewayStatusResult result = gateway.checkStatus(reference);

        intent.setLastPolledAt(Instant.now());
        intent.setPollCount(intent.getPollCount() + 1);
        switch (result.status()) {
            case SUCCEEDED -> confirmPayment(intent, result);
            case FAILED -> {
                intent.setIntentStatus(IntentStatus.FAILED);
                intent.setFailureReason("Declined by " + intent.getProvider());
            }
            case PENDING -> stopPollingIfExhausted(intent, "Payment window elapsed");
            case UNKNOWN -> {
                log.debug("No answer for {} yet; will retry", reference);
                stopPollingIfExhausted(intent, "No answer from " + intent.getProvider());
            }
        }
    }

    /**
     * Every non-terminal intent must eventually leave the poller's queue, or
     * findStalePending keeps handing it back: it orders by lastPolledAt ascending,
     * so the most neglected rows sit at the head of the batch and crowd out real
     * work. Expiry covers the normal case. The poll cap covers UNKNOWN, where
     * expiresAt may never have been set because the gateway never answered.
     */
    private void stopPollingIfExhausted(PaymentIntent intent, String giveUpReason) {
        if (intent.isExpired()) {
            intent.setIntentStatus(IntentStatus.EXPIRED);
            intent.setFailureReason("Payment window elapsed");
        } else if (intent.getPollCount() >= MAX_POLL_ATTEMPTS) {
            intent.setIntentStatus(IntentStatus.EXPIRED);
            intent.setFailureReason(giveUpReason + " after " + MAX_POLL_ATTEMPTS + " checks");

            log.warn("Giving up on intent {} after {} checks", intent.getReference(), intent.getPollCount());
        }
    }

    @Override
    @Transactional
    public PaymentStatusResponse confirmWalletPayment(Long customerId, String reference) {
        // Customer-scoped read first: you cannot confirm someone else's intent
        PaymentIntent intent = intentRepository
            .findByReferenceForCustomer(reference, customerId)
            .orElseThrow(() -> new ResourceNotFoundException("Payment intent " + reference + " was not found"));

        if (!WalletPaymentGatewayAdapter.PROVIDER.equals(intent.getProvider())) {
            throw new ValidationException("This payment is not a wallet payment");
        }

        if (intent.getIntentStatus().isTerminal()) {
            return checkoutMapper.toStatusResponse(intent);
        }
        // Stop here. Falling through would debit a customer whose payment
        // window has already closed, and confirmPayment would then refuse to
        // act on the terminal intent — money gone, no invoice.
        if (intent.isExpired()) {
            intent.setIntentStatus(IntentStatus.EXPIRED);
            intent.setFailureReason("Payment window elapsed. Please try again");
            return checkoutMapper.toStatusResponse(intent);
        }

        // 1. Debit — writes the ledger row that checkStatus will find.
        //    Insufficient balance throws 402 here and nothing else happens.

        walletService.debit(
            customerId,
            intent.getCurrency(),
            intent.getAmount(),
            WalletTxnType.PURCHASE,
            intent.getId(),
            intent.getOrderId(),
            "Order payment " + reference
        );

        // 2. Same path as every other provider: lock intent → checkStatus
        //    (finds the debit row) → confirmPayment → invoice, payment,
        //    order INVOICED.

        verifyAndProcess(reference);
        return checkoutMapper.toStatusResponse(
            intentRepository
                .findByReference(reference)
                .orElseThrow(() -> new ResourceNotFoundException("Payment " + reference + " was not found"))
        );
    }

    /**
     * ≤ 20 chars, alphanumeric only — PayWay's tran_id rules.
     * "T" + yyMMddHHmmss + 5 random = 18 chars, unique enough per
     * second; the DB unique constraint catches the rest.
     */

    private String newReference() {
        String time = DateTimeFormatter.ofPattern("yyMMddHHmmss").withZone(ZoneOffset.UTC).format(Instant.now());

        StringBuilder suffix = new StringBuilder(5);

        for (int i = 0; i < 5; i++) {
            suffix.append(ALPHANUMERIC.charAt(RANDOM.nextInt(ALPHANUMERIC.length())));
        }

        return "T" + time + suffix;
    }

    /**
     * Money is confirmed. Everything in here is ONE transaction:
     * if any step fails, all of it rolls back and the poller retries.
     */

    private void confirmPayment(PaymentIntent intent, GatewayStatusResult result) {
        // The amount comes from check-transaction, not from any client
        // or pushback. If it does not match what we asked for, stop.

        if (result.amount() != null && result.amount().compareTo(intent.getAmount()) != 0) {
            log.error(
                "AMOUNT MISMATCH on {}: intent {} vs gateway {} — flagged",
                intent.getReference(),
                intent.getAmount(),
                result.amount()
            );

            intent.setIntentStatus(IntentStatus.FAILED);
            intent.setFailureReason("Amount mismatch — manual review required");
            return;
        }

        Order order = orderRepository
            .findWithItemsById(intent.getOrderId())
            .orElseThrow(() -> new ResourceNotFoundException("Order not found"));

        if (order.getStatus() != OrderStatus.PENDING) {
            log.warn(
                "Payment confirmed for order {} which is {} — flagged for review",
                order.getOrderNumber(),
                order.getStatus()
            );
            return;
        }

        intent.setIntentStatus(IntentStatus.SUCCEEDED);
        intent.setProviderTxnId(result.providerTxnId() != null ? result.providerTxnId() : intent.getReference());
        intent.setConfirmedAt(Instant.now());

        Invoice invoice = invoiceService.createIssuedInvoiceFromOrder(order);
        PaymentGatewayPort gateway = gatewayResolver.resolve(intent.getProvider());

        Payment payment = new Payment();
        payment.setInvoice(invoice);
        payment.setPaymentIntentId(intent.getId());
        payment.setSource(PaymentSource.GATEWAY);
        payment.setAmount(intent.getAmount());
        payment.setCurrency(intent.getCurrency());

        payment.setPaymentMethod(gateway.paymentMethod());
        payment.setPaymentStatus(PaymentStatus.COMPLETED);
        // payment_date is NOT NULL; same zone as the invoice's issue date so the
        // two documents never disagree about which day the money arrived.
        payment.setPaymentDate(LocalDate.now(ZONE));
        payment.setReferenceNumber(intent.getProviderTxnId());
        payment.setNotes("Paid online via " + intent.getProvider());
        paymentRepository.save(payment);
        invoice.getPayments().add(payment);
        invoiceService.refreshPaymentState(invoice); // PAID -> Balance 0
        order.setStatus(OrderStatus.INVOICED);
        log.info(
            "Order {} paid online: invoice {}, txn {}",
            order.getOrderNumber(),
            invoice.getInvoiceNumber(),
            intent.getProviderTxnId()
        );
    }
}
