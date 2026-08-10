package com.angkor.commerce.order.dto.request;

import jakarta.validation.Valid;
import jakarta.validation.constraints.NotEmpty;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import java.util.List;

public record CreateOrderRequest(
    @NotEmpty(message = "At least one item is required")
    @Valid // ← validates each item in the list
    List<OrderItemRequest> items,

    @NotNull(message = "Shipping address is required") Long shippingAddressId,

    @Size(max = 500) String notes
) {}
