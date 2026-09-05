import { z } from "zod";

/**
 * Wire shapes for `/storefront/orders`, exactly as core-api serialises them.
 *
 * `status` is lowercase on the wire (OrderStatus carries @JsonValue), unlike the payment and
 * invoice enums, which have none and stay uppercase.
 */
export const orderStatusSchema = z.enum(["pending", "invoiced", "cancelled"]);

export const orderItemDtoSchema = z.object({
    id: z.number(),
    productId: z.number(),
    variantId: z.number(),
    sku: z.string(),
    title: z.string(),
    /** Already a resolved URL here — OrderMapper runs it through ImageStorageService. */
    thumbnail: z.string().nullable(),
    unitPrice: z.number(),
    quantity: z.number(),
    lineTotal: z.number()
});

export const shippingDetailsDtoSchema = z.object({
    fullName: z.string(),
    phone: z.string(),
    address: z.string(),
    city: z.string(),
    postalCode: z.string().nullable(),
    notes: z.string().nullable()
});

export const orderDtoSchema = z.object({
    id: z.number(),
    orderNumber: z.string(),
    status: orderStatusSchema,
    items: z.array(orderItemDtoSchema),
    subtotal: z.number(),
    shippingFee: z.number(),
    total: z.number(),
    currency: z.string(),
    totalItems: z.number(),
    totalQuantity: z.number(),
    shipping: shippingDetailsDtoSchema,
    placedAt: z.string(),
    createdAt: z.string(),
    updatedAt: z.string()
});

export const orderSummaryDtoSchema = z.object({
    id: z.number(),
    orderNumber: z.string(),
    status: orderStatusSchema,
    total: z.number(),
    currency: z.string(),
    totalItems: z.number(),
    totalQuantity: z.number(),
    placedAt: z.string()
});

/** PageResponse<T> names the rows after the resource. */
export const orderPageDtoSchema = z.object({
    orders: z.array(orderSummaryDtoSchema),
    total: z.number(),
    skip: z.number(),
    limit: z.number()
});

export type OrderDto = z.infer<typeof orderDtoSchema>;
export type OrderSummaryDto = z.infer<typeof orderSummaryDtoSchema>;
export type OrderPageDto = z.infer<typeof orderPageDtoSchema>;
