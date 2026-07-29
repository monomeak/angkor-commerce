import type { Product } from "../types/product";

export const products: Product[] = [
  {
    id: 1,
    name: "Classic Cotton Shirt",
    categoryId: 4, // men-shirt
    images: [],
    description: "A breathable cotton shirt for everyday wear.",
    quantity: 42,
    rating: 4.5,
    promotionPercentage: 0,
    price: 18,
  },
  {
    id: 2,
    name: "Everyday Men T-Shirt",
    categoryId: 5, // men-t-shirt
    images: [],
    description: "Soft jersey t-shirt in a relaxed fit.",
    quantity: 55,
    rating: 4.3,
    promotionPercentage: 10,
    price: 14,
  },
  {
    id: 3,
    name: "Woven Krama Scarf",
    categoryId: 8, // men-krama
    images: [],
    description: "Traditional Khmer krama, hand-woven cotton.",
    quantity: 60,
    rating: 4.8,
    promotionPercentage: 10,
    price: 12,
  },
  {
    id: 4,
    name: "Everyday Short-Pants",
    categoryId: 9, // men-short-pants
    images: [],
    description: "Lightweight short-pants for warm weather.",
    quantity: 35,
    rating: 4.2,
    promotionPercentage: 0,
    price: 15,
  },
  {
    id: 5,
    name: "Woven Sampot Skirt",
    categoryId: 12, // women-sampot
    images: [],
    description: "Traditional Khmer sampot with hand-woven pattern.",
    quantity: 20,
    rating: 4.9,
    promotionPercentage: 15,
    price: 45,
  },
  {
    id: 6,
    name: "Classic Sampot",
    categoryId: 12, // women-sampot
    images: [],
    description: "Everyday sampot in a solid weave.",
    quantity: 18,
    rating: 4.6,
    promotionPercentage: 20,
    price: 39,
  },
  {
    id: 7,
    name: "Silk Blend Blouse",
    categoryId: 11, // women-blouse
    images: [],
    description: "Lightweight blouse with a silk-blend finish.",
    quantity: 28,
    rating: 4.4,
    promotionPercentage: 0,
    price: 22,
  },
  {
    id: 8,
    name: "Occasion Dress",
    categoryId: 13, // women-dress
    images: [],
    description: "A versatile dress for both casual and formal occasions.",
    quantity: 15,
    rating: 4.6,
    promotionPercentage: 20,
    price: 38,
  },
  {
    id: 9,
    name: "Kids Krama Set",
    categoryId: 20, // children-krama
    images: [],
    description: "Soft cotton krama sized for children.",
    quantity: 50,
    rating: 4.7,
    promotionPercentage: 0,
    price: 8,
  },
  {
    id: 10,
    name: "Kids Everyday Shirt",
    categoryId: 17, // children-shirt
    images: [],
    description: "Durable, comfortable shirt for daily play.",
    quantity: 40,
    rating: 4.3,
    promotionPercentage: 5,
    price: 10,
  },
  {
    id: 11,
    name: "Kids Play Dress",
    categoryId: 19, // children-dresses
    images: [],
    description: "Comfortable dress for play and outings.",
    quantity: 22,
    rating: 4.5,
    promotionPercentage: 0,
    price: 16,
  },
];
