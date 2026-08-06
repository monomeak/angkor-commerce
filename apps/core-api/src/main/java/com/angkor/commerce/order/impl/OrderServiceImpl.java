package com.angkor.commerce.order.impl;

import static java.util.function.Function.identity;

import com.angkor.commerce.common.CollectionKeys;
import com.angkor.commerce.common.dto.PageResponse;
import com.angkor.commerce.common.exception.ResourceNotFoundException;
import com.angkor.commerce.common.exception.ValidationException;
import com.angkor.commerce.customer.Customer;
import com.angkor.commerce.customer.CustomerRepository;
import com.angkor.commerce.customer.address.CustomerAddress;
import com.angkor.commerce.customer.address.CustomerAddressRepository;
import com.angkor.commerce.order.Order;
import com.angkor.commerce.order.OrderItem;
import com.angkor.commerce.order.OrderNumberGenerator;
import com.angkor.commerce.order.OrderRepository;
import com.angkor.commerce.order.OrderService;
import com.angkor.commerce.order.OrderStatus;
import com.angkor.commerce.order.dto.request.CreateOrderRequest;
import com.angkor.commerce.order.dto.request.OrderItemRequest;
import com.angkor.commerce.order.dto.request.OrderQueryParams;
import com.angkor.commerce.order.dto.request.UpdateOrderStatusRequest;
import com.angkor.commerce.order.dto.response.OrderResponse;
import com.angkor.commerce.order.dto.response.OrderSummaryResponse;
import com.angkor.commerce.order.mapper.OrderMapper;
import com.angkor.commerce.product.port.ProductStockPort;
import com.angkor.commerce.product.port.StockChange;
import com.angkor.commerce.product.port.VariantSnapshot;
import java.math.BigDecimal;
import java.time.Instant;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import java.util.Set;
import java.util.stream.Collectors;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.data.domain.Page;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.util.StringUtils;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class OrderServiceImpl implements OrderService {

    // Inject the required services

    private final OrderRepository orderRepository;
    private final CustomerRepository customerRepository;
    private final CustomerAddressRepository addressRepository;
    private final ProductStockPort productStockPort;
    private final OrderNumberGenerator orderNumberGenerator;
    private final OrderMapper orderMapper;

    @Value("${angkor.order.shipping-fee:0}")
    private BigDecimal flatShippingFee;

    // ══════════════════════════════════════════════════════
    // CHECKOUT — the important one
    // ══════════════════════════════════════════════════════

    @Override
    @Transactional
    public OrderResponse createOrder(Long customerId, CreateOrderRequest request) {
        // ── 1. Who is ordering ──
        Customer customer = customerRepository
            .findById(customerId)
            .orElseThrow(() -> new ResourceNotFoundException("Customer " + customerId + " was not found"));

        // ── 2. Where it ships ──
        // Scoped by customerId, so you cannot ship to someone else's address
        CustomerAddress address = addressRepository
            .findActiveByIdAndCustomerId(request.shippingAddressId(), customerId)
            .orElseThrow(() ->
                new ResourceNotFoundException("Address " + request.shippingAddressId() + " was not found")
            );

        // ── 3. Merge duplicate lines ── as needed
        // A client may send variant 7 twice. Treat it as one line of 3.
        // LinkedHashMap preserves the order the customer added them in.
        Map<Long, Integer> quantities = request
            .items()
            .stream()
            .collect(
                Collectors.toMap(
                    OrderItemRequest::variantId,
                    OrderItemRequest::quantity,
                    Integer::sum,
                    LinkedHashMap::new
                )
            );

        // ── 4. Look up real data — ONE query for all variants ──
        Map<Long, VariantSnapshot> snapshots = productStockPort
            .getVariantSnapshots(quantities.keySet())
            .stream()
            .collect(Collectors.toMap(VariantSnapshot::variantId, identity()));

        validateAllPurchasable(quantities.keySet(), snapshots);

        // ── 5. Build the order ──
        Order order = new Order();
        order.setCustomer(customer);
        order.setOrderNumber(orderNumberGenerator.next());
        order.setStatus(OrderStatus.PENDING);
        order.setPlacedAt(Instant.now());
        order.setShippingNotes(request.notes());
        copyShippingAddress(order, address);

        String currency = null;
        BigDecimal subtotal = BigDecimal.ZERO;

        for (Map.Entry<Long, Integer> entry : quantities.entrySet()) {
            VariantSnapshot snap = snapshots.get(entry.getKey());
            int quantity = entry.getValue();

            // Mixed currencies would make the total meaningless
            if (currency == null) {
                currency = snap.currency();
            } else if (!currency.equals(snap.currency())) {
                throw new ValidationException("All items in one order must use the same currency");
            }

            BigDecimal lineTotal = snap.unitPrice().multiply(BigDecimal.valueOf(quantity));

            order.addItem(buildItem(snap, quantity, lineTotal));
            subtotal = subtotal.add(lineTotal);
        }
        order.setCurrency(currency);
        order.setSubtotal(subtotal);
        order.setShippingFee(flatShippingFee);
        order.setTotal(subtotal.add(flatShippingFee));

        // ── 6. Take the stock, last ──
        // Everything else has passed. A failure here means someone
        // genuinely beat us to the last item

        productStockPort.reserveStock(
            quantities
                .entrySet()
                .stream()
                .map(e -> new StockChange(e.getKey(), e.getValue()))
                .toList()
        );

        // cascade = ALL saves the items too
        return orderMapper.toResponse(orderRepository.save(order));
    }

    // ══════════════════════════════════════════════════════
    // Storefront reads
    // ══════════════════════════════════════════════════════

    @Override
    public OrderResponse getMyOrder(Long customerId, Long orderId) {
        return orderMapper.toResponse(load(customerId, orderId));
    }

    @Override
    public PageResponse<OrderSummaryResponse> getMyOrders(Long customerId, OrderQueryParams q) {
        OrderStatus status = q.status();
        Page<Order> page =
            status == null
                ? orderRepository.findByCustomerId(customerId, q.toPageable())
                : orderRepository.findByCustomerIdAndStatus(customerId, status, q.toPageable());
        return toPageResponse(page, q);
    }

    @Override
    @Transactional
    public OrderResponse cancelMyOrder(Long customerId, Long orderId) {
        Order order = load(customerId, orderId);
        if (!order.getStatus().canTransitionTo(OrderStatus.CANCELLED)) {
            throw new ValidationException(
                "An order that is %s cannot be cancelled".formatted(order.getStatus().name().toLowerCase())
            );
        }
        order.setStatus(OrderStatus.CANCELLED);
        releaseStockFor(order);
        return orderMapper.toResponse(order);
    }

    // ══════════════════════════════════════════════════════
    // Back office
    // ══════════════════════════════════════════════════════

    @Override
    public PageResponse<OrderSummaryResponse> getOrders(OrderQueryParams q) {
        OrderStatus status = q.status();
        Page<Order> page =
            status == null
                ? orderRepository.findAll(q.toPageable())
                : orderRepository.findByStatus(status, q.toPageable());
        return toPageResponse(page, q);
    }

    @Override
    public OrderResponse getOrder(Long id) {
        return orderMapper.toResponse(orderRepository.findWithItemsById(id).orElseThrow(() -> notFound(id)));
    }

    @Override
    @Transactional
    public OrderResponse updateStatus(Long id, UpdateOrderStatusRequest request) {
        Order order = orderRepository.findWithItemsById(id).orElseThrow(() -> notFound(id));

        OrderStatus current = order.getStatus();
        OrderStatus next = request.status();

        if (current == next) {
            return orderMapper.toResponse(order); // no-op, not an error
        }

        if (!current.canTransitionTo(next)) {
            throw new ValidationException(
                "Cannot move an order from %s to %s".formatted(current.name().toLowerCase(), next.name().toLowerCase())
            );
        }

        order.setStatus(next);
        if (next == OrderStatus.CANCELLED) {
            releaseStockFor(order);
        }
        return orderMapper.toResponse(order);
    }

    // Helper function

    private void validateAllPurchasable(Set<Long> requestedIds, Map<Long, VariantSnapshot> snapshots) {
        List<Long> missing = requestedIds
            .stream()
            .filter(id -> !snapshots.containsKey(id))
            .toList();

        if (!missing.isEmpty()) {
            throw new ResourceNotFoundException("Product variants not found: " + missing);
        }

        List<String> unavailable = snapshots
            .values()
            .stream()
            .filter(s -> !s.purchasable())
            .map(VariantSnapshot::sku)
            .toList();

        if (!unavailable.isEmpty()) {
            throw new ValidationException("No longer available: " + String.join(", ", unavailable));
        }
    }

    // build Order Item
    private OrderItem buildItem(VariantSnapshot snap, int quantity, BigDecimal lineTotal) {
        OrderItem item = new OrderItem();
        item.setProductId(snap.productId());
        item.setProductVariantId(snap.variantId());
        item.setSku(snap.sku());
        item.setTitle(buildTitle(snap));
        item.setThumbnailUrl(snap.thumbnailKey());
        item.setUnitPriceSnapshot(snap.unitPrice());
        item.setQuantity(quantity);
        item.setLineTotal(lineTotal);
        return item;
    }

    // Build simple Order Title
    private String buildTitle(VariantSnapshot snap) {
        return StringUtils.hasText(snap.size()) ? snap.productName() + " — " + snap.size() : snap.productName();
    }

    // Copy shipping address
    private void copyShippingAddress(Order order, CustomerAddress addr) {
        order.setShippingFullName(addr.getRecipientName());
        order.setShippingPhone(addr.getRecipientPhone());
        order.setShippingAddress(OrderMapper.flattenAddressLines(addr));
        order.setShippingCity(addr.getProvince());
        order.setShippingPostalCode(addr.getPostalCode());
    }

    private void releaseStockFor(Order order) {
        productStockPort.releaseStock(
            order
                .getItems()
                .stream()
                .map(i -> new StockChange(i.getProductVariantId(), i.getQuantity()))
                .toList()
        );
    }

    private PageResponse<OrderSummaryResponse> toPageResponse(Page<Order> page, OrderQueryParams query) {
        String key = CollectionKeys.ORDERS;
        if (page.isEmpty()) {
            return PageResponse.empty(key, query.skipOrDefault(), query.limitOrDefault());
        }
        return PageResponse.of(
            key,
            page.getContent().stream().map(orderMapper::toSummary).toList(),
            page.getTotalElements(),
            query.skipOrDefault(),
            query.limitOrDefault()
        );
    }

    private Order load(Long customerId, Long orderId) {
        Order order = orderRepository
            .findWithItemsByIdAndCustomerId(orderId, customerId)
            .orElseThrow(() -> notFound(orderId));

        return order;
    }

    private ResourceNotFoundException notFound(Long orderId) {
        return new ResourceNotFoundException("Order " + orderId + " was not found");
    }
}
