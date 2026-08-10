package com.angkor.commerce.common.util;

import java.time.Year;
import java.time.ZoneId;
import java.util.function.LongSupplier;
import lombok.RequiredArgsConstructor;

// one generator can both order and invoice

/**
 * Produces ORD-2026-000042, INV-2026-000042, and so on.
 * with its own prefix and sequence.
 */

@RequiredArgsConstructor
public class DocumentNumberGenerator {

    private static final ZoneId ZONE = ZoneId.of("Asia/Phnom_Penh");
    private final String prefix;
    private final LongSupplier sequenceSource;

    public String next() {
        return "%s-%d-%06d".formatted(prefix, Year.now(ZONE).getValue(), sequenceSource.getAsLong());
    }
}
