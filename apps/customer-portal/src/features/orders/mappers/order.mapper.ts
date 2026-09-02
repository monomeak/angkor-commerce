import type { OrderDto, OrderPageDto, OrderSummaryDto } from "../schemas/order-api.schema";
import type { Order, OrderPage, OrderSummary } from "../types/order";

/** Field-for-field: unlike the catalogue, orders come back fully populated — nothing is nullable. */
export function mapOrder(dto: OrderDto): Order {
    return {
        id: dto.id,
        orderNumber: dto.orderNumber,
        status: dto.status,
        items: dto.items.map((item) => ({
            id: item.id,
            productId: item.productId,
            variantId: item.variantId,
            sku: item.sku,
            title: item.title,
            thumbnail: item.thumbnail,
            unitPrice: item.unitPrice,
            quantity: item.quantity,
            lineTotal: item.lineTotal
        })),
        subtotal: dto.subtotal,
        shippingFee: dto.shippingFee,
        total: dto.total,
        currency: dto.currency,
        totalItems: dto.totalItems,
        totalQuantity: dto.totalQuantity,
        shipping: dto.shipping,
        placedAt: dto.placedAt
    };
}

export function mapOrderSummary(dto: OrderSummaryDto): OrderSummary {
    return { ...dto };
}

export function mapOrderPage(dto: OrderPageDto): OrderPage {
    return {
        items: dto.orders.map(mapOrderSummary),
        total: dto.total,
        skip: dto.skip,
        limit: dto.limit
    };
}
