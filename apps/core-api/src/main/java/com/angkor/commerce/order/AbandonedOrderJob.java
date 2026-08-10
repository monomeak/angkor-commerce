package com.angkor.commerce.order;

import com.angkor.commerce.payment.intent.PaymentIntentRepository;
import com.angkor.commerce.product.port.ProductStockPort;
import com.angkor.commerce.product.port.StockChange;
import java.time.Duration;
import java.time.Instant;
import java.util.List;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

@Component
@RequiredArgsConstructor
@Slf4j
public class AbandonedOrderJob {

    private final OrderRepository orderRepository;
    private final PaymentIntentRepository intentRepository;
    private final ProductStockPort productStockPort;

    // Every 5 minutes: cancel PENDING orders older that 30 mins with no live payment.
    @Scheduled(cron = "0 */5 * * * *")
    @Transactional
    public void cancelAbandoned() {
        Instant cutoff = Instant.now().minus(Duration.ofMinutes(30));

        List<Order> stale = orderRepository.findPendingOlderThan(cutoff);

        for (Order order : stale) {
            //A live intent means the customer may be mid-payment — skip
            boolean paying = intentRepository
                .findLiveByOrderId(order.getId())
                .filter(i -> !i.isExpired())
                .isPresent();
            if (paying) continue; // skip the below step move to next
            order.setStatus(OrderStatus.CANCELLED);
            productStockPort.releaseStock(
                order
                    .getItems()
                    .stream()
                    .map(i -> new StockChange(i.getProductVariantId(), i.getQuantity()))
                    .toList()
            );
            log.info("Cancelled abandoned order {} — stock released", order.getOrderNumber());
        }
    }
}
