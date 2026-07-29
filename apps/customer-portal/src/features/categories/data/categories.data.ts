import type { Category } from "../types/category";

// Domain categories to preserve — see docs/NEXTJS_MIGRATION_PLAN.md.
// Top-level: Men / Women / Children. Each has clothing subcategories,
// shaped like the parent/child rows apps/core-api will serve.
export const categories: Category[] = [
  { id: 1, parentId: null, name: "Men", slug: "men" },
  { id: 2, parentId: null, name: "Women", slug: "women" },
  { id: 3, parentId: null, name: "Children", slug: "children" },

  { id: 4, parentId: 1, name: "Shirt", slug: "men-shirt" },
  { id: 5, parentId: 1, name: "T-shirt", slug: "men-t-shirt" },
  { id: 6, parentId: 1, name: "Pants", slug: "men-pants" },
  { id: 7, parentId: 1, name: "Hats", slug: "men-hats" },
  { id: 8, parentId: 1, name: "Krama", slug: "men-krama" },
  { id: 9, parentId: 1, name: "Short-pants", slug: "men-short-pants" },
  { id: 10, parentId: 1, name: "Shoes", slug: "men-shoes" },

  { id: 11, parentId: 2, name: "Blouse", slug: "women-blouse" },
  { id: 12, parentId: 2, name: "Sampot", slug: "women-sampot" },
  { id: 13, parentId: 2, name: "Dress", slug: "women-dress" },
  { id: 14, parentId: 2, name: "Scarf", slug: "women-scarf" },
  { id: 15, parentId: 2, name: "Accessories", slug: "women-accessories" },
  { id: 16, parentId: 2, name: "Shoes", slug: "women-shoes" },

  { id: 17, parentId: 3, name: "Shirt", slug: "children-shirt" },
  { id: 18, parentId: 3, name: "Pants", slug: "children-pants" },
  { id: 19, parentId: 3, name: "Dresses", slug: "children-dresses" },
  { id: 20, parentId: 3, name: "Krama", slug: "children-krama" },
  { id: 21, parentId: 3, name: "Shoes", slug: "children-shoes" },
  { id: 22, parentId: 3, name: "Accessories", slug: "children-accessories" },
];
