package com.angkor.commerce.order;

import java.time.Year;
import java.time.ZoneId;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Component;

@Component
@RequiredArgsConstructor
public class OrderNumberGenerator {

    private static final ZoneId ZONE = ZoneId.of("Asia/Phnom_Penh");
    private final OrderRepository orderRepository;

    /** Produces ORD-2026-000042 */

    public String next() {
        int year = Year.now(ZONE).getValue();
        long sequence = orderRepository.nextOrderSequence();
        String generatedString = "ORD-%d-%06d".formatted(year, sequence);
        return generatedString;
    }
}
