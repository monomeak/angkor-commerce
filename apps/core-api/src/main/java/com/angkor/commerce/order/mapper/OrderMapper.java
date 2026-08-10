package com.angkor.commerce.order.mapper;

import com.angkor.commerce.common.storage.ImageStorageService;
import com.angkor.commerce.customer.address.CustomerAddress;
import com.angkor.commerce.order.Order;
import com.angkor.commerce.order.OrderItem;
import com.angkor.commerce.order.dto.response.OrderItemResponse;
import com.angkor.commerce.order.dto.response.OrderResponse;
import com.angkor.commerce.order.dto.response.OrderSummaryResponse;
import com.angkor.commerce.order.dto.response.ShippingDetailsResponse;
import java.util.List;
import java.util.stream.Collectors;
import java.util.stream.Stream;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Component;
import org.springframework.util.StringUtils;

@Component
@RequiredArgsConstructor
public class OrderMapper {

    private final ImageStorageService imageStorageService;

    // ── Address flattening ─────────────────────────────────

    /**
     * Collapses the structured address into the single TEXT column.
     * Blank parts are skipped so no ", , " gaps appear.
     *
     * "No. 12B, Street 271, 2nd floor, Toul Tumpoung 1, Chamkarmon"
     */

    public static String flattenAddressLines(CustomerAddress addr) {
        return Stream.of(addr.getLine1(), addr.getLine2(), addr.getCommune(), addr.getDistrict())
            .filter(StringUtils::hasText)
            .collect(Collectors.joining(", "));
    }

    // ── Order → DTO ────────────────────────────────────────

    public OrderResponse toResponse(Order order) {
        List<OrderItem> items = order.getItems();

        return new OrderResponse(
            order.getId(),
            order.getOrderNumber(),
            order.getStatus(),
            items.stream().map(this::toItemResponse).toList(),
            order.getSubtotal(),
            order.getShippingFee(),
            order.getTotal(),
            order.getCurrency(),
            items.size(),
            items.stream().mapToInt(OrderItem::getQuantity).sum(),
            toShippingResponse(order),
            order.getPlacedAt(),
            order.getCreatedAt(),
            order.getUpdatedAt()
        );
    }

    public OrderItemResponse toItemResponse(OrderItem item) {
        return new OrderItemResponse(
            item.getId(),
            item.getProductId(),
            item.getProductVariantId(),
            item.getSku(),
            item.getTitle(),
            imageStorageService.resolveUrl(item.getThumbnailUrl()),
            item.getUnitPriceSnapshot(),
            item.getQuantity(),
            item.getLineTotal()
        );
    }

    public ShippingDetailsResponse toShippingResponse(Order order) {
        return new ShippingDetailsResponse(
            order.getShippingFullName(),
            order.getShippingPhone(),
            order.getShippingAddress(),
            order.getShippingCity(),
            order.getShippingPostalCode(),
            order.getShippingNotes()
        );
    }

    public OrderSummaryResponse toSummary(Order order) {
        List<OrderItem> items = order.getItems();
        return new OrderSummaryResponse(
            order.getId(),
            order.getOrderNumber(),
            order.getStatus(),
            order.getTotal(),
            order.getCurrency(),
            items.size(),
            items.stream().mapToInt(OrderItem::getQuantity).sum(),
            order.getPlacedAt()
        );
    }
}
