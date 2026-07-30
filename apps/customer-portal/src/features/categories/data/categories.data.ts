import type { Category } from "../types/category";

// Domain categories to preserve — see docs/NEXTJS_MIGRATION_PLAN.md.
// Top-level: Men / Women / Children. Each has clothing subcategories,
// shaped like the parent/child rows apps/core-api will serve.
export const categories: Category[] = [
    { id: 1, parentId: null, name: "Men", slug: "men", sortOrder: 0 },
    { id: 2, parentId: null, name: "Women", slug: "women", sortOrder: 0 },
    { id: 3, parentId: null, name: "Children", slug: "children", sortOrder: 0 },

    { id: 4, parentId: 1, name: "Shirt", slug: "men-shirt", sortOrder: 0 },
    { id: 5, parentId: 1, name: "T-shirt", slug: "men-t-shirt", sortOrder: 10 },
    { id: 6, parentId: 1, name: "Pants", slug: "men-pants", sortOrder: 20 },
    { id: 7, parentId: 1, name: "Hats", slug: "men-hats", sortOrder: 30 },
    { id: 8, parentId: 1, name: "Krama", slug: "men-krama", sortOrder: 40 },
    { id: 9, parentId: 1, name: "Short-pants", slug: "men-short-pants", sortOrder: 50 },
    { id: 10, parentId: 1, name: "Shoes", slug: "men-shoes", sortOrder: 60 },

    { id: 11, parentId: 2, name: "Blouse", slug: "women-blouse", sortOrder: 0 },
    { id: 12, parentId: 2, name: "Sampot (Skirt)", slug: "women-sampot", sortOrder: 10 },
    { id: 13, parentId: 2, name: "Dress", slug: "women-dress", sortOrder: 20 },
    { id: 14, parentId: 2, name: "Scarf (Krama)", slug: "women-scarf", sortOrder: 30 },
    { id: 15, parentId: 2, name: "Accessories", slug: "women-accessories", sortOrder: 40 },
    { id: 16, parentId: 2, name: "Shoes", slug: "women-shoes", sortOrder: 50 },

    { id: 17, parentId: 3, name: "Shirt", slug: "children-shirt", sortOrder: 0 },
    { id: 18, parentId: 3, name: "Pants", slug: "children-pants", sortOrder: 10 },
    { id: 19, parentId: 3, name: "Dresses", slug: "children-dresses", sortOrder: 20 },
    { id: 20, parentId: 3, name: "Krama", slug: "children-krama", sortOrder: 30 },
    { id: 21, parentId: 3, name: "Shoes", slug: "children-shoes", sortOrder: 40 },
    { id: 22, parentId: 3, name: "Accessories", slug: "children-accessories", sortOrder: 50 }
];
