package com.angkor.commerce.order.dto.response;

import com.angkor.commerce.order.OrderStatus;
import java.math.BigDecimal;
import java.time.Instant;
import java.util.List;

public record OrderResponse(
    Long id,
    String orderNumber,
    OrderStatus status,
    List<OrderItemResponse> items,
    BigDecimal subtotal,
    BigDecimal shippingFee,
    BigDecimal total,
    String currency,
    // computed
    Integer totalItems,
    Integer totalQuantity,
    ShippingDetailsResponse shipping,
    //  pot
    Instant placedAt,
    Instant createdAt,
    Instant updatedAt
) {}
