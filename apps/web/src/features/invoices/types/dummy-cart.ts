export interface DummyCartProduct {
  id: string;
  title: string;
  price: number;
  quantity: number;
  total: number;
  discountPercentage: number;
  discountedTotal: number;
  thumbnail: string;
}

export interface DummyCart {
  id: string;
  products: DummyCartProduct[];
  total: number;
  discountedTotal: number;
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
