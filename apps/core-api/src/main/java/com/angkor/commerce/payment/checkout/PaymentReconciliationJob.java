package com.angkor.commerce.payment.checkout;

import com.angkor.commerce.payment.intent.PaymentIntent;
import com.angkor.commerce.payment.intent.PaymentIntentRepository;
import java.time.Duration;
import java.time.Instant;
import java.util.List;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.PageRequest;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;

@Component
@RequiredArgsConstructor
@Slf4j
public class PaymentReconciliationJob {

    private static final Duration POLL_AFTER = Duration.ofSeconds(20);
    private static final int BATCH = 25;

    private final PaymentIntentRepository intentRepository;
    private final CheckoutService checkoutService;

    @Scheduled(fixedDelayString = "${angkor.payment.reconcile-interval:30000}")
    public void reconcile() {
        Instant cutoff = Instant.now().minus(POLL_AFTER);
        List<PaymentIntent> stale = intentRepository.findStalePending(cutoff, PageRequest.of(0, BATCH));
        for (PaymentIntent intent : stale) {
            try {
                checkoutService.verifyAndProcess(intent.getReference());
            } catch (Exception e) {
                // One bad intent must not stop the rest of the batch
                log.error("Reconciliation failed for {}", intent.getReference(), e);
            }
        }
    }
}
