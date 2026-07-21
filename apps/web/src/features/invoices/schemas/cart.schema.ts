import { z } from "zod";

export const cartProductSchema = z.object({
  id: z.coerce.string(),
  title: z.string(),
  price: z.number(),
  quantity: z.number(),
  total: z.number(),
  discountPercentage: z.number(),
  discountedTotal: z.number(),
  thumbnail: z.string(),
});

export const cartSchema = z.object({
  id: z.coerce.string(),
  products: z.array(cartProductSchema),
  total: z.number(),
  discountedTotal: z.number(),
  userId: z.number(),
  totalProducts: z.number(),
  totalQuantity: z.number(),
});

export const cartsResponseSchema = z.object({
  carts: z.array(cartSchema),
  total: z.number(),
  skip: z.number(),
  limit: z.number(),
});

export type ValidatedCart = z.infer<typeof cartSchema>;
export type ValidatedCartsResponse = z.infer<typeof cartsResponseSchema>;
