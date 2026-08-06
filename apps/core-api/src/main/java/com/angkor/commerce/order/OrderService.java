package com.angkor.commerce.order;

import com.angkor.commerce.common.dto.PageResponse;
import com.angkor.commerce.order.dto.request.CreateOrderRequest;
import com.angkor.commerce.order.dto.request.OrderQueryParams;
import com.angkor.commerce.order.dto.request.UpdateOrderStatusRequest;
import com.angkor.commerce.order.dto.response.OrderResponse;
import com.angkor.commerce.order.dto.response.OrderSummaryResponse;

public interface OrderService {
    // ── Storefront ──
    OrderResponse createOrder(Long customerId, CreateOrderRequest request);
    OrderResponse getMyOrder(Long customerId, Long orderId);
    PageResponse<OrderSummaryResponse> getMyOrders(Long customerId, OrderQueryParams q);
    OrderResponse cancelMyOrder(Long customerId, Long orderId);

    // ── Back office ──
    PageResponse<OrderSummaryResponse> getOrders(OrderQueryParams q);
    OrderResponse getOrder(Long id);
    OrderResponse updateStatus(Long id, UpdateOrderStatusRequest request);
}
