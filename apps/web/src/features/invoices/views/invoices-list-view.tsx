export interface DummyCartProduct {
  id: string;
  title: string;
  price: number;
  total: number;
  discountPercentage: number;
  discountedTotal: number;
  thumbnail: string;
}

export interface DummyCart {
  id: number;
  products: DummyCartProduct[];
  total: number;
  discountTotal: number;
  userId: number;
  totalProducts: number;
  totalQuantity: number;
}

export interface DummyCartsResponse {
  carts: DummyCart[];
  total: number;
  skip: number;
  limit: number;
}
