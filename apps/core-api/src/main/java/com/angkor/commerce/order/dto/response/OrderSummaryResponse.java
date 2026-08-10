package com.angkor.commerce.order.dto.response;

import com.angkor.commerce.order.OrderStatus;
import java.math.BigDecimal;
import java.time.Instant;

public record OrderSummaryResponse(
    Long id,
    String orderNumber,
    OrderStatus status,
    BigDecimal total,
    String currency,
    Integer totalItems,
    Integer totalQuantity,
    Instant placedAt
) {}
