package com.angkor.commerce.order.dto.request;

import com.angkor.commerce.order.OrderStatus;
import jakarta.validation.constraints.NotNull;

public record UpdateOrderStatusRequest(@NotNull(message = "Status is required") OrderStatus status) {}
