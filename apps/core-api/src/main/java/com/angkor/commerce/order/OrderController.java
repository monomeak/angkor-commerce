package com.angkor.commerce.order;

import com.angkor.commerce.common.ApiConstants;
import com.angkor.commerce.common.dto.PageResponse;
import com.angkor.commerce.invoice.InvoiceService;
import com.angkor.commerce.invoice.dto.response.InvoiceResponse;
import com.angkor.commerce.order.dto.request.CreateOrderRequest;
import com.angkor.commerce.order.dto.request.OrderQueryParams;
import com.angkor.commerce.order.dto.response.OrderResponse;
import com.angkor.commerce.order.dto.response.OrderSummaryResponse;
import com.angkor.commerce.security.JwtAuthenticationFilter.AuthenticatedCustomer;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping(ApiConstants.STOREFRONT_ORDERS)
@RequiredArgsConstructor
@Validated
@Tag(name = "Orders (Storefront)")
public class OrderController {

    private final OrderService orderService;
    private final InvoiceService invoiceService;

    @PostMapping
    public ResponseEntity<OrderResponse> createOrder(
        @AuthenticationPrincipal AuthenticatedCustomer customer,
        @RequestBody @Valid CreateOrderRequest request
    ) {
        return ResponseEntity.ok(orderService.createOrder(customer.id(), request));
    }

    @GetMapping()
    @Operation(summary = "List my orders")
    public ResponseEntity<PageResponse<OrderSummaryResponse>> getMyOrders(
        @AuthenticationPrincipal AuthenticatedCustomer customer,
        @Valid OrderQueryParams q
    ) {
        return ResponseEntity.ok(orderService.getMyOrders(customer.id(), q));
    }

    @GetMapping("/{orderId}")
    @Operation(summary = "Get one of my oder")
    public ResponseEntity<OrderResponse> getMyOrder(
        @AuthenticationPrincipal AuthenticatedCustomer customer,
        @PathVariable Long orderId
    ) {
        return ResponseEntity.ok(orderService.getMyOrder(customer.id(), orderId));
    }

    @GetMapping("/{orderId}/invoice")
    @Operation(summary = "The receipt for a paid order — 404 until the payment lands")
    public ResponseEntity<InvoiceResponse> getMyOrderInvoice(
        @AuthenticationPrincipal AuthenticatedCustomer customer,
        @PathVariable Long orderId
    ) {
        return ResponseEntity.ok(invoiceService.getMyInvoiceForOrder(customer.id(), orderId));
    }

    @PostMapping("/{orderId}/cancel")
    @Operation(summary = "Cancel a pending order")
    public ResponseEntity<OrderResponse> cancelMyOrderResponseEntity(
        @AuthenticationPrincipal AuthenticatedCustomer customer,
        @PathVariable Long orderId
    ) {
        return ResponseEntity.ok(orderService.cancelMyOrder(customer.id(), orderId));
    }
}
