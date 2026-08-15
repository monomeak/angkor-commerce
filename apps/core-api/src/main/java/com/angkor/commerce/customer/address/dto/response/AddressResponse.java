package com.angkor.commerce.customer.address.dto.response;

import java.math.BigDecimal;
import java.time.Instant;

public record AddressResponse(
    Long id,
    String label,
    String recipientName,
    String recipientPhone,
    String line1,
    String line2,
    String commune,
    String district,
    String province,
    String postalCode,
    String country,
    BigDecimal latitude,
    BigDecimal longitude,
    boolean isDefault,
    Instant createdAt,
    Instant updatedAt
) {}
