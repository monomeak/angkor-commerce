export type OrderLine = {
  productId: number;
  name: string;
  size: string;
  quantity: number;
  // Price at time of purchase — later product price changes shouldn't
  // retroactively change a placed order's total.
  unitPrice: number;
};

export type ShippingAddress = {
  fullName: string;
  phone: string;
  address: string;
  city: string;
  postalCode?: string;
  notes?: string;
};

export type PaymentMethod = "cod" | "card";

export type Order = {
  orderNumber: string;
  placedAt: string;
  items: OrderLine[];
  shippingAddress: ShippingAddress;
  paymentMethod: PaymentMethod;
  card?: { brand: string; last4: string };
  subtotal: number;
  shippingFee: number;
  total: number;
};
