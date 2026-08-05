# Product full object, list, and detail — implementation reference

Status: **not applied to the codebase yet** — this is a reference doc with copy-paste-ready
code, written up per request instead of editing `src/`/`app/` directly. Say the word and I'll
apply it file-by-file.

Companion to the design discussion in this thread. Source of truth for the target shape:
[`docs/CORE_API_DATA_MODEL.md`](../../../docs/CORE_API_DATA_MODEL.md) §3 (`Product`/`ProductVariant`/`ProductImage`)
and [`docs/CORE_API_ENDPOINTS.md`](../../../docs/CORE_API_ENDPOINTS.md) (`{items, total, skip, limit}` list envelope,
unwrapped resource for detail).

## What changes and why

- `Product` fields rename to match `core-api`: `name`→`title`, `promotionPercentage`→`discountPercentage`,
  plus new `currency`/`unit`/`thumbnailUrl`. `quantity` is dropped from `Product` entirely — stock now
  lives on `ProductVariant` only, per data-model decision 9 ("every product has ≥1 variant row").
- Two new base types, `ProductVariant` and `ProductImage`, mirror their tables 1:1.
- Two **composed** shapes replace the flat `Product` in consumers:
  - `ProductDetail` = `Product & { variants[]; images[] }` — the full joined object, for `GET /products/{id}`.
  - `ProductSummary` = `Product & { inStock, totalStock, minPrice, maxPrice, availableSizes }` — a light
    projection for list/grid views, for `GET /products?...`. No `variants[]`/`images[]` arrays in the
    payload; `thumbnailUrl` (already on `Product`) covers the card image without joining `product_images`.
- `PaginatedResponse<T> = { items, total, skip, limit }` wraps `ProductSummary[]` for list endpoints;
  `ProductDetail` is returned bare for the single-resource endpoint (no envelope), matching the endpoints doc.
- The size picker on `ProductCard`/`ProductDetail` currently **fakes** sizes from the category name
  (`getSizeOptions`, shoe vs. everything-else). It's replaced by real per-product variant data.
- Mock data moves from one flat `products.data.ts` array into three files that get joined client-side —
  `products.data.ts` (base rows), `product-variants.data.ts`, `product-images.data.ts` — exercising the
  same join logic `core-api` will eventually do in SQL.

---

## 1. Types — `src/features/products/types/product.ts`

```ts
export const ONE_SIZE = "one-size";

// ---- Base entities (mirror core-api tables 1:1, see CORE_API_DATA_MODEL.md §3) ----

export type Product = {
  id: number;
  title: string;
  description: string;
  categoryId: number;
  price: number;
  currency: string;
  discountPercentage: number;
  rating: number;
  unit: string;
  thumbnailUrl: string;
};

export type ProductVariant = {
  id: number;
  productId: number;
  size: string | null; // null = the product's single no-size row (decision 9)
  sku: string;
  stock: number;
  priceOverride: number | null; // null → falls back to Product.price
};

export type ProductImage = {
  id: number;
  productId: number;
  imageUrl: string;
  displayOrder: number;
};

// ---- Composed shapes ----

// Full joined object — GET /products/{id}, returned directly (no envelope).
export type ProductDetail = Product & {
  variants: ProductVariant[]; // always >= 1, sorted by size
  images: ProductImage[]; // sorted by displayOrder
};

// List projection — GET /products?skip=&limit=. Derived aggregates instead
// of the raw relations, to keep list payloads flat and light.
export type ProductSummary = Product & {
  inStock: boolean;
  totalStock: number;
  minPrice: number;
  maxPrice: number;
  availableSizes: string[];
};

export type PaginatedResponse<T> = {
  items: T[];
  total: number;
  skip: number;
  limit: number;
};

export type ProductListResponse = PaginatedResponse<ProductSummary>;
```

## 2. Join logic — `src/features/products/mappers/product-mappers.ts` (new folder)

Per `AGENTS.md`'s convention, `mappers/` shows up "once a real API exists" — this is that: the
join/derivation logic that stands in for `core-api`'s SQL joins today, and becomes the DTO→domain
mapper once the real endpoints land.

```ts
import type {
  Product,
  ProductDetail,
  ProductImage,
  ProductSummary,
  ProductVariant,
} from "../types/product";

export function toProductDetail(
  product: Product,
  allVariants: ProductVariant[],
  allImages: ProductImage[],
): ProductDetail {
  return {
    ...product,
    variants: allVariants
      .filter((variant) => variant.productId === product.id)
      .sort((a, b) => (a.size ?? "").localeCompare(b.size ?? "")),
    images: allImages
      .filter((image) => image.productId === product.id)
      .sort((a, b) => a.displayOrder - b.displayOrder),
  };
}

export function toProductSummary(product: Product, allVariants: ProductVariant[]): ProductSummary {
  const ownVariants = allVariants.filter((variant) => variant.productId === product.id);
  const prices = ownVariants.map((variant) => variant.priceOverride ?? product.price);
  const totalStock = ownVariants.reduce((sum, variant) => sum + variant.stock, 0);

  return {
    ...product,
    inStock: totalStock > 0,
    totalStock,
    minPrice: prices.length > 0 ? Math.min(...prices) : product.price,
    maxPrice: prices.length > 0 ? Math.max(...prices) : product.price,
    availableSizes: ownVariants
      .map((variant) => variant.size)
      .filter((size): size is string => size !== null),
  };
}

export function getEffectivePrice(product: Product, variant: ProductVariant): number {
  return variant.priceOverride ?? product.price;
}
```

## 3. Mock data — three files replacing `products.data.ts`

### `src/features/products/data/products.data.ts` (base rows only)

```ts
import type { Product } from "../types/product";

export const products: Product[] = [
  { id: 1, title: "Classic Cotton Shirt", categoryId: 4, description: "A breathable cotton shirt for everyday wear.", price: 18, currency: "USD", discountPercentage: 0, rating: 4.5, unit: "piece", thumbnailUrl: "/image.png" },
  { id: 2, title: "Everyday Men T-Shirt", categoryId: 5, description: "Soft jersey t-shirt in a relaxed fit.", price: 14, currency: "USD", discountPercentage: 10, rating: 4.3, unit: "piece", thumbnailUrl: "/image.png" },
  { id: 3, title: "Woven Krama Scarf", categoryId: 8, description: "Traditional Khmer krama, hand-woven cotton.", price: 12, currency: "USD", discountPercentage: 10, rating: 4.8, unit: "piece", thumbnailUrl: "/image.png" },
  { id: 4, title: "Everyday Short-Pants", categoryId: 9, description: "Lightweight short-pants for warm weather.", price: 15, currency: "USD", discountPercentage: 0, rating: 4.2, unit: "piece", thumbnailUrl: "/image.png" },
  { id: 5, title: "Woven Sampot Skirt", categoryId: 12, description: "Traditional Khmer sampot with hand-woven pattern.", price: 45, currency: "USD", discountPercentage: 15, rating: 4.9, unit: "piece", thumbnailUrl: "/image.png" },
  { id: 6, title: "Classic Sampot", categoryId: 12, description: "Everyday sampot in a solid weave.", price: 39, currency: "USD", discountPercentage: 20, rating: 4.6, unit: "piece", thumbnailUrl: "/image.png" },
  { id: 7, title: "Silk Blend Blouse", categoryId: 11, description: "Lightweight blouse with a silk-blend finish.", price: 22, currency: "USD", discountPercentage: 0, rating: 4.4, unit: "piece", thumbnailUrl: "/image.png" },
  { id: 8, title: "Occasion Dress", categoryId: 13, description: "A versatile dress for both casual and formal occasions.", price: 38, currency: "USD", discountPercentage: 20, rating: 4.6, unit: "piece", thumbnailUrl: "/image.png" },
  { id: 9, title: "Kids Krama Set", categoryId: 20, description: "Soft cotton krama sized for children.", price: 8, currency: "USD", discountPercentage: 0, rating: 4.7, unit: "piece", thumbnailUrl: "/image.png" },
  { id: 10, title: "Kids Everyday Shirt", categoryId: 17, description: "Durable, comfortable shirt for daily play.", price: 10, currency: "USD", discountPercentage: 5, rating: 4.3, unit: "piece", thumbnailUrl: "/image.png" },
  { id: 11, title: "Kids Play Dress", categoryId: 19, description: "Comfortable dress for play and outings.", price: 16, currency: "USD", discountPercentage: 0, rating: 4.5, unit: "piece", thumbnailUrl: "/image.png" },
  { id: 12, title: "Relaxed Fit Chinos", categoryId: 6, description: "Everyday chinos with a comfortable relaxed fit.", price: 26, currency: "USD", discountPercentage: 0, rating: 4.4, unit: "piece", thumbnailUrl: "/image.png" },
  { id: 13, title: "Woven Straw Hat", categoryId: 7, description: "Lightweight straw hat for sun protection.", price: 16, currency: "USD", discountPercentage: 0, rating: 4.2, unit: "piece", thumbnailUrl: "/image.png" },
  { id: 14, title: "Everyday Canvas Sneakers", categoryId: 10, description: "Durable canvas sneakers for daily wear.", price: 28, currency: "USD", discountPercentage: 10, rating: 4.5, unit: "piece", thumbnailUrl: "/image.png" },
  { id: 15, title: "Silk Krama Scarf", categoryId: 14, description: "Lightweight silk-blend krama scarf.", price: 18, currency: "USD", discountPercentage: 0, rating: 4.7, unit: "piece", thumbnailUrl: "/image.png" },
  { id: 16, title: "Handwoven Rattan Clutch", categoryId: 15, description: "Handwoven rattan clutch bag with fabric lining.", price: 24, currency: "USD", discountPercentage: 0, rating: 4.6, unit: "piece", thumbnailUrl: "/image.png" },
  { id: 17, title: "Everyday Strap Sandals", categoryId: 16, description: "Comfortable strap sandals for daily wear.", price: 22, currency: "USD", discountPercentage: 15, rating: 4.3, unit: "piece", thumbnailUrl: "/image.png" },
  { id: 18, title: "Kids Comfort Pants", categoryId: 18, description: "Stretchy, durable pants built for active kids.", price: 12, currency: "USD", discountPercentage: 0, rating: 4.4, unit: "piece", thumbnailUrl: "/image.png" },
  { id: 19, title: "Kids Canvas Shoes", categoryId: 21, description: "Lightweight canvas shoes for everyday play.", price: 14, currency: "USD", discountPercentage: 0, rating: 4.5, unit: "piece", thumbnailUrl: "/image.png" },
  { id: 20, title: "Kids Sun Hat", categoryId: 22, description: "Soft cotton sun hat for outdoor play.", price: 9, currency: "USD", discountPercentage: 0, rating: 4.3, unit: "piece", thumbnailUrl: "/image.png" },
  { id: 21, title: "Linen Button-Down Shirt", categoryId: 4, description: "Breathable linen shirt for warm-weather wear.", price: 24, currency: "USD", discountPercentage: 0, rating: 4.4, unit: "piece", thumbnailUrl: "/image.png" },
  { id: 22, title: "Graphic Print Tee", categoryId: 5, description: "Cotton tee with a screen-printed Angkor motif.", price: 15, currency: "USD", discountPercentage: 0, rating: 4.2, unit: "piece", thumbnailUrl: "/image.png" },
  { id: 23, title: "Slim Fit Jeans", categoryId: 6, description: "Stretch denim jeans with a slim fit.", price: 32, currency: "USD", discountPercentage: 5, rating: 4.3, unit: "piece", thumbnailUrl: "/image.png" },
  { id: 24, title: "Wide Brim Sun Hat", categoryId: 7, description: "Wide-brim hat for outdoor sun protection.", price: 19, currency: "USD", discountPercentage: 0, rating: 4.1, unit: "piece", thumbnailUrl: "/image.png" },
  { id: 25, title: "Royal Silk Sampot", categoryId: 12, description: "Formal silk sampot with a woven gold border.", price: 68, currency: "USD", discountPercentage: 0, rating: 4.9, unit: "piece", thumbnailUrl: "/image.png" },
  { id: 26, title: "Everyday Sampot Wrap", categoryId: 12, description: "Easy wrap-style sampot for daily wear.", price: 32, currency: "USD", discountPercentage: 0, rating: 4.4, unit: "piece", thumbnailUrl: "/image.png" },
  { id: 27, title: "Sampot Chong Kben", categoryId: 12, description: "Traditional Chong Kben style sampot for ceremonies.", price: 72, currency: "USD", discountPercentage: 0, rating: 4.8, unit: "piece", thumbnailUrl: "/image.png" },
  { id: 28, title: "Floral Sampot Hol", categoryId: 12, description: "Hand-woven Hol pattern sampot with floral motifs.", price: 58, currency: "USD", discountPercentage: 10, rating: 4.7, unit: "piece", thumbnailUrl: "/image.png" },
  { id: 29, title: "Sampot Phamuong", categoryId: 12, description: "Twill-weave Phamuong sampot in a solid color.", price: 49, currency: "USD", discountPercentage: 0, rating: 4.6, unit: "piece", thumbnailUrl: "/image.png" },
  { id: 30, title: "Casual Cotton Sampot", categoryId: 12, description: "Lightweight cotton sampot for everyday errands.", price: 26, currency: "USD", discountPercentage: 0, rating: 4.3, unit: "piece", thumbnailUrl: "/image.png" },
  { id: 31, title: "Sampot for Ceremony", categoryId: 12, description: "Embellished sampot suited for special occasions.", price: 65, currency: "USD", discountPercentage: 15, rating: 4.9, unit: "piece", thumbnailUrl: "/image.png" },
];
```

### `src/features/products/data/product-variants.data.ts` (new)

Generates variant rows deterministically instead of hand-authoring ~150 objects. `STOCK_SEED` carries
over the old flat `quantity` field, now split across each product's sizes.

```ts
import { products } from "./products.data";
import type { ProductVariant } from "../types/product";

const SHOE_SIZES = ["39", "40", "41", "42", "43", "44"];
const APPAREL_SIZES = ["S", "M", "L", "XL"];
const SHOE_CATEGORY_IDS = new Set([10, 16, 21]); // men-shoes, women-shoes, children-shoes

// Total units in stock per product — carried over from the old flat
// `quantity` field now that stock lives on ProductVariant, not Product
// (see docs/CORE_API_DATA_MODEL.md decision 9).
const STOCK_SEED: Record<number, number> = {
  1: 42, 2: 55, 3: 60, 4: 35, 5: 20, 6: 18, 7: 28, 8: 15, 9: 50, 10: 40,
  11: 22, 12: 30, 13: 25, 14: 33, 15: 40, 16: 20, 17: 27, 18: 38, 19: 32, 20: 45,
  21: 30, 22: 48, 23: 26, 24: 20, 25: 12, 26: 24, 27: 10, 28: 14, 29: 16, 30: 30, 31: 8,
};

// A couple of products sell one size at a premium — demonstrates
// ProductVariant.priceOverride (e.g. a larger/made-to-order size costing
// more than the product's base price).
const PRICE_OVERRIDES: Record<string, number> = {
  "8-XL": 42, // Occasion Dress, XL
  "25-L": 72, // Royal Silk Sampot, L
};

function buildVariants(productId: number, categoryId: number, totalStock: number): ProductVariant[] {
  const sizes = SHOE_CATEGORY_IDS.has(categoryId) ? SHOE_SIZES : APPAREL_SIZES;
  const base = Math.floor(totalStock / sizes.length);
  const remainder = totalStock % sizes.length;

  return sizes.map((size, index) => ({
    id: productId * 100 + index,
    productId,
    size,
    sku: `SKU-${productId}-${size}`,
    stock: base + (index < remainder ? 1 : 0), // spread the remainder over the first few sizes
    priceOverride: PRICE_OVERRIDES[`${productId}-${size}`] ?? null,
  }));
}

export const productVariants: ProductVariant[] = products.flatMap((product) =>
  buildVariants(product.id, product.categoryId, STOCK_SEED[product.id] ?? 0),
);
```

### `src/features/products/data/product-images.data.ts` (new)

```ts
import { products } from "./products.data";
import type { ProductImage } from "../types/product";

// No product photography exists yet (see docs/NEXTJS_MIGRATION_PLAN.md
// "Assets Migration"). Every product gets its thumbnail as its sole gallery
// image for now — adding real photos later means adding more rows here, the
// shape doesn't change.
export const productImages: ProductImage[] = products.map((product) => ({
  id: product.id,
  productId: product.id,
  imageUrl: product.thumbnailUrl,
  displayOrder: 0,
}));
```

### `src/features/products/data/product-catalog.ts` (new — precomputed join)

Cart/checkout components (`cart-sheet.tsx`, `order-summary.tsx`, `checkout-form.tsx`) look up a
product by id **synchronously**, outside React Query. This precomputed export keeps that working
without threading async `fetchProducts` through client components that just need a price lookup.

```ts
import { productVariants } from "./product-variants.data";
import { products } from "./products.data";
import { toProductSummary } from "../mappers/product-mappers";
import type { ProductSummary } from "../types/product";

// Precomputed join, mirrors what GET /storefront/products returns per item.
export const productSummaries: ProductSummary[] = products.map((product) =>
  toProductSummary(product, productVariants),
);
```

## 4. `src/features/products/lib/product-helpers.ts` (rewrite)

`getSizeOptions` is gone — sizes now come from real variant data, not a category-name guess.
Filter helpers become generic over anything with the relevant fields, so they work for both
`ProductSummary` (list) and raw joins.

```ts
import { getDescendantCategoryIds } from "@/src/features/categories/lib/category-helpers";
import type { Product } from "../types/product";

export function getDiscountedPrice(product: Pick<Product, "price" | "discountPercentage">): number {
  const discount = (product.price * product.discountPercentage) / 100;
  return Math.round((product.price - discount) * 100) / 100;
}

export function getProductById<T extends { id: number }>(items: T[], id: number): T | undefined {
  return items.find((item) => item.id === id);
}

export function filterProductsByCategory<T extends { categoryId: number }>(
  items: T[],
  categoryId: number,
): T[] {
  const allowedCategoryIds = new Set(getDescendantCategoryIds(categoryId));
  return items.filter((item) => allowedCategoryIds.has(item.categoryId));
}

export function filterProductsByQuery<T extends { title: string; description: string }>(
  items: T[],
  query: string,
): T[] {
  const normalized = query.trim().toLowerCase();
  if (!normalized) {
    return items;
  }

  return items.filter(
    (item) =>
      item.title.toLowerCase().includes(normalized) ||
      item.description.toLowerCase().includes(normalized),
  );
}

export function filterProductsByPriceRange<T extends { minPrice: number }>(
  items: T[],
  minPrice: number,
  maxPrice: number,
): T[] {
  return items.filter((item) => item.minPrice >= minPrice && item.minPrice <= maxPrice);
}
```

## 5. `src/features/products/lib/query-keys.ts`

```ts
import type { ProductFilters } from "../api/product-api";

export const productKeys = {
  all: ["products"] as const,
  list: (filters?: ProductFilters) => [...productKeys.all, "list", filters ?? {}] as const,
  detail: (id: number) => [...productKeys.all, "detail", id] as const,
};
```

## 6. `src/features/products/lib/pagination-helpers.ts` (add one function, keep the rest)

`getPageRange` is unchanged (pure page-number UI math). `resolvePage` assumed `totalPages` was known
*before* fetching — no longer true once pagination is server-side (`total` only comes back with the
response). `resolveProductPage` replaces that call site: fetch once with the requested page, and only
refetch if the requested page turned out to be out of range once `total` is known.

```ts
// Collapses a long page run into first/last + a window around the current
// page, e.g. [1, "ellipsis", 4, 5, 6, "ellipsis", 20].
export function getPageRange(currentPage: number, totalPages: number): (number | "ellipsis")[] {
  const delta = 1;
  const pages: number[] = [];

  for (let page = 1; page <= totalPages; page += 1) {
    if (page === 1 || page === totalPages || Math.abs(page - currentPage) <= delta) {
      pages.push(page);
    }
  }

  const range: (number | "ellipsis")[] = [];
  let previous = 0;
  for (const page of pages) {
    if (previous && page - previous > 1) {
      range.push("ellipsis");
    }
    range.push(page);
    previous = page;
  }

  return range;
}

// Fetches a page of a paginated resource, clamping an out-of-range page
// param against the server-reported `total` (known only after the first
// call). Refetches once, corrected, if the naive page was out of range.
export async function resolveProductPage<T>(
  fetchPage: (skip: number, limit: number) => Promise<{ items: T[]; total: number }>,
  pageParam: string | undefined,
  pageSize: number,
): Promise<{ items: T[]; total: number; currentPage: number; totalPages: number }> {
  const requested = Number(pageParam);
  const naivePage = Math.max(Number.isFinite(requested) ? Math.trunc(requested) : 1, 1);

  const first = await fetchPage((naivePage - 1) * pageSize, pageSize);
  const totalPages = Math.max(1, Math.ceil(first.total / pageSize));
  const currentPage = Math.min(naivePage, totalPages);

  if (currentPage === naivePage) {
    return { items: first.items, total: first.total, currentPage, totalPages };
  }

  const corrected = await fetchPage((currentPage - 1) * pageSize, pageSize);
  return { items: corrected.items, total: corrected.total, currentPage, totalPages };
}
```

## 7. `src/features/products/api/product-api.ts` (rewrite)

```ts
import { getCategoryBySlug } from "@/src/features/categories/lib/category-helpers";
import { productImages } from "../data/product-images.data";
import { productVariants } from "../data/product-variants.data";
import { products } from "../data/products.data";
import {
  filterProductsByCategory,
  filterProductsByPriceRange,
  filterProductsByQuery,
} from "../lib/product-helpers";
import { toProductDetail, toProductSummary } from "../mappers/product-mappers";
import type { ProductDetail, ProductListResponse } from "../types/product";

export type ProductFilters = {
  categorySlug?: string;
  query?: string;
  minPrice?: number;
  maxPrice?: number;
  skip?: number;
  limit?: number;
};

// No backend yet (see docs/NEXTJS_MIGRATION_PLAN.md). These resolve against
// local mock data but are shaped like the future core-api calls documented
// in docs/CORE_API_ENDPOINTS.md: GET /storefront/products returns
// {items, total, skip, limit}; GET /storefront/products/{id} returns the
// joined resource directly, no envelope.
export async function fetchProducts(filters?: ProductFilters): Promise<ProductListResponse> {
  let matched = products.map((product) => toProductSummary(product, productVariants));

  if (filters?.categorySlug) {
    const category = getCategoryBySlug(filters.categorySlug);
    matched = category ? filterProductsByCategory(matched, category.id) : [];
  }

  if (filters?.query) {
    matched = filterProductsByQuery(matched, filters.query);
  }

  if (filters?.minPrice !== undefined && filters?.maxPrice !== undefined) {
    matched = filterProductsByPriceRange(matched, filters.minPrice, filters.maxPrice);
  }

  const skip = filters?.skip ?? 0;
  const limit = filters?.limit ?? matched.length;
  const items = matched.slice(skip, skip + limit);

  return { items, total: matched.length, skip, limit };
}

export async function fetchProductById(id: number): Promise<ProductDetail | null> {
  const product = products.find((item) => item.id === id);
  return product ? toProductDetail(product, productVariants, productImages) : null;
}
```

## 8. `src/features/products/hooks/use-products.ts`

```ts
import { useQuery } from "@tanstack/react-query";
import { fetchProductById, fetchProducts, type ProductFilters } from "../api/product-api";
import { productKeys } from "../lib/query-keys";

export function useProductsQuery(filters?: ProductFilters) {
  return useQuery({
    queryKey: productKeys.list(filters),
    queryFn: () => fetchProducts(filters),
  });
}

export function useProductQuery(id: number) {
  return useQuery({
    queryKey: productKeys.detail(id),
    queryFn: () => fetchProductById(id),
  });
}
```

## 9. Components

### `src/features/products/components/product-card.tsx` (`ProductSummary`)

```tsx
"use client";

import { useState } from "react";
import { Heart, Star } from "lucide-react";
import Link from "next/link";
import Image from "next/image";

import { getCategoryById } from "@/src/features/categories/lib/category-helpers";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { useCart } from "@/src/features/cart/lib/cart-context";
import { getDiscountedPrice } from "../lib/product-helpers";
import { ONE_SIZE, type ProductSummary } from "../types/product";

type ProductCardProps = {
    readonly product: ProductSummary;
    readonly className?: string;
};

export function ProductCard({ product, className }: ProductCardProps) {
    const category = getCategoryById(product.categoryId);
    const hasDiscount = product.discountPercentage > 0;
    const discountedPrice = getDiscountedPrice(product);
    const sizeOptions = product.availableSizes.length > 0 ? product.availableSizes : [ONE_SIZE];
    const [selectedSize, setSelectedSize] = useState(sizeOptions[0]);
    const [isFavorite, setIsFavorite] = useState(false);
    const detailHref = category ? `/product/${category.slug}/${product.id}` : undefined;
    const { addItem } = useCart();

    return (
        <Card
            className={cn(
                "gap-4 p-3 transition-transform duration-300 hover:-translate-y-1 hover:ring-primary/50",
                className
            )}
        >
            <Link
                href={detailHref ?? "#"}
                className="relative flex aspect-square items-center justify-center overflow-hidden rounded-xl bg-gradient-to-br from-muted to-muted/40"
            >
                <Image src={product.thumbnailUrl} alt={product.title} width={200} height={200} />
                {hasDiscount && (
                    <Badge variant="destructive" className="absolute top-2 left-2">
                        -{product.discountPercentage}%
                    </Badge>
                )}
                <button
                    type="button"
                    onClick={(event) => {
                        event.preventDefault();
                        event.stopPropagation();
                        setIsFavorite((value) => !value);
                    }}
                    aria-pressed={isFavorite}
                    aria-label={isFavorite ? "Remove from favorites" : "Add to favorites"}
                    className="absolute top-2 right-2 flex size-8 items-center justify-center rounded-full bg-background/80 text-muted-foreground shadow-sm transition-colors hover:text-destructive"
                >
                    <Heart className={cn("size-4", isFavorite && "fill-destructive text-destructive")} />
                </button>
            </Link>

            <div className="flex flex-col gap-3 px-1">
                <div className="flex items-start justify-between gap-3">
                    <h3 className="font-semibold">
                        <Link href={detailHref ?? "#"} className="hover:underline">
                            {product.title}
                        </Link>{" "}
                        <span className="text-sm font-normal text-muted-foreground">
                            ({product.rating.toFixed(1)}
                            <Star className="mb-0.5 ml-0.5 inline size-3 fill-current" />)
                        </span>
                    </h3>
                    <div className="flex shrink-0 flex-col items-end">
                        <span className="text-lg font-bold">${discountedPrice.toFixed(2)}</span>
                        {hasDiscount && (
                            <span className="text-xs text-muted-foreground line-through">
                                ${product.price.toFixed(2)}
                            </span>
                        )}
                    </div>
                </div>

                <p className="line-clamp-2 text-sm text-muted-foreground">{product.description}</p>

                {product.availableSizes.length > 0 && (
                    <div>
                        <p className="mb-2 text-sm">What is your size?</p>
                        <div className="flex flex-wrap gap-2">
                            {sizeOptions.map((size) => (
                                <button
                                    key={size}
                                    type="button"
                                    onClick={() => setSelectedSize(size)}
                                    aria-pressed={size === selectedSize}
                                    className={cn(
                                        "flex h-9 min-w-9 items-center justify-center rounded-full border px-2 text-sm font-medium transition-colors",
                                        size === selectedSize
                                            ? "border-primary bg-primary text-primary-foreground"
                                            : "border-border text-muted-foreground hover:border-primary hover:text-foreground"
                                    )}
                                >
                                    {size}
                                </button>
                            ))}
                        </div>
                    </div>
                )}

                <Button
                    variant="accent"
                    size="lg"
                    className="w-full"
                    disabled={!product.inStock}
                    onClick={() => addItem(product.id, selectedSize, 1)}
                >
                    {product.inStock ? "Add to cart" : "Out of stock"}
                </Button>
            </div>
        </Card>
    );
}
```

### `src/features/products/components/product-detail.tsx` (`ProductDetail`, real variants + gallery)

```tsx
"use client";

import { useState } from "react";
import { Star } from "lucide-react";
import Image from "next/image";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { useCart } from "@/src/features/cart/lib/cart-context";
import { getDiscountedPrice } from "../lib/product-helpers";
import { getEffectivePrice } from "../mappers/product-mappers";
import { ONE_SIZE, type ProductDetail as ProductDetailType } from "../types/product";

type ProductDetailProps = {
    readonly product: ProductDetailType;
    readonly categoryName: string;
};

export function ProductDetail({ product, categoryName }: ProductDetailProps) {
    const [selectedImageIndex, setSelectedImageIndex] = useState(0);
    const [selectedVariantId, setSelectedVariantId] = useState(product.variants[0]?.id);
    const [quantity, setQuantity] = useState(1);
    const { addItem } = useCart();

    const selectedVariant =
        product.variants.find((variant) => variant.id === selectedVariantId) ?? product.variants[0];
    const effectivePrice = getEffectivePrice(product, selectedVariant);
    const hasDiscount = product.discountPercentage > 0;
    const discountedPrice = getDiscountedPrice({
        price: effectivePrice,
        discountPercentage: product.discountPercentage,
    });
    const activeImage = product.images[selectedImageIndex] ?? product.images[0];
    const hasSizes = product.variants.some((variant) => variant.size !== null);

    return (
        <div className="mt-6 grid gap-8 lg:grid-cols-2">
            <div className="flex flex-col gap-3">
                <div className="relative flex aspect-square items-center justify-center overflow-hidden rounded-2xl bg-gradient-to-br from-muted to-muted/40">
                    <Image
                        src={activeImage?.imageUrl ?? "/image.png"}
                        alt={product.title}
                        width={400}
                        height={400}
                    />
                    {hasDiscount && (
                        <Badge variant="destructive" className="absolute top-3 left-3">
                            -{product.discountPercentage}%
                        </Badge>
                    )}
                </div>
                {product.images.length > 1 && (
                    <div className="flex gap-2">
                        {product.images.map((image, index) => (
                            <button
                                key={image.id}
                                type="button"
                                onClick={() => setSelectedImageIndex(index)}
                                aria-pressed={index === selectedImageIndex}
                                className={cn(
                                    "size-16 overflow-hidden rounded-lg border-2",
                                    index === selectedImageIndex ? "border-primary" : "border-transparent"
                                )}
                            >
                                <Image src={image.imageUrl} alt="" width={64} height={64} />
                            </button>
                        ))}
                    </div>
                )}
            </div>

            <div className="flex flex-col gap-5">
                <div>
                    <p className="text-sm font-medium text-muted-foreground">{categoryName}</p>
                    <h1 className="mt-1 text-3xl font-semibold tracking-[-0.03em]">{product.title}</h1>
                    <div className="mt-2 flex items-center gap-1 text-sm text-muted-foreground">
                        <Star className="size-4 fill-current text-accent" />
                        {product.rating.toFixed(1)}
                    </div>
                </div>

                <div className="flex items-baseline gap-3">
                    <span className="text-3xl font-bold">${discountedPrice.toFixed(2)}</span>
                    {hasDiscount && (
                        <span className="text-lg text-muted-foreground line-through">
                            ${effectivePrice.toFixed(2)}
                        </span>
                    )}
                </div>

                <p className="text-muted-foreground">{product.description}</p>

                {hasSizes && (
                    <div>
                        <p className="mb-2 text-sm font-medium">What is your size?</p>
                        <div className="flex flex-wrap gap-2">
                            {product.variants.map((variant) => (
                                <button
                                    key={variant.id}
                                    type="button"
                                    onClick={() => setSelectedVariantId(variant.id)}
                                    disabled={variant.stock === 0}
                                    aria-pressed={variant.id === selectedVariant.id}
                                    className={cn(
                                        "flex h-10 min-w-10 items-center justify-center rounded-full border px-3 text-sm font-medium transition-colors disabled:cursor-not-allowed disabled:opacity-40",
                                        variant.id === selectedVariant.id
                                            ? "border-primary bg-primary text-primary-foreground"
                                            : "border-border text-muted-foreground hover:border-primary hover:text-foreground"
                                    )}
                                >
                                    {variant.size}
                                </button>
                            ))}
                        </div>
                    </div>
                )}

                <div>
                    <p className="mb-2 text-sm font-medium">Quantity</p>
                    <div className="flex w-fit items-center rounded-full border">
                        <button
                            type="button"
                            onClick={() => setQuantity((value) => Math.max(1, value - 1))}
                            className="flex size-10 items-center justify-center text-lg text-muted-foreground transition-colors hover:text-foreground"
                            aria-label="Decrease quantity"
                        >
                            −
                        </button>
                        <span className="w-10 text-center text-sm font-medium">{quantity}</span>
                        <button
                            type="button"
                            onClick={() =>
                                setQuantity((value) => Math.min(selectedVariant.stock, value + 1))
                            }
                            className="flex size-10 items-center justify-center text-lg text-muted-foreground transition-colors hover:text-foreground"
                            aria-label="Increase quantity"
                        >
                            +
                        </button>
                    </div>
                    <p className="mt-1 text-xs text-muted-foreground">
                        {selectedVariant.stock > 0 ? `${selectedVariant.stock} in stock` : "Out of stock"}
                    </p>
                </div>

                <Button
                    variant="accent"
                    size="lg"
                    className="h-12 w-full text-sm sm:w-auto sm:px-10"
                    disabled={selectedVariant.stock === 0}
                    onClick={() => addItem(product.id, selectedVariant.size ?? ONE_SIZE, quantity)}
                >
                    Add to cart
                </Button>
            </div>
        </div>
    );
}
```

### `src/features/products/components/best-offers.tsx` (unwrap `.items`, rename field)

```tsx
"use client";

import { getCategoryBySlug } from "@/src/features/categories/lib/category-helpers";
import { Skeleton } from "@/components/ui/skeleton";
import { useProductsQuery } from "../hooks/use-products";
import { ProductCard } from "./product-card";

type BestOffersProps = {
  readonly categorySlug: string;
};

export function BestOffers({ categorySlug }: BestOffersProps) {
  const category = getCategoryBySlug(categorySlug);
  const { data, isLoading } = useProductsQuery({ categorySlug });
  const offers = (data?.items ?? []).filter((product) => product.discountPercentage > 0);

  if (!isLoading && offers.length === 0) {
    return null;
  }

  return (
    <section className="mx-auto max-w-6xl px-4 py-10 sm:px-6">
      <h2 className="text-3xl font-semibold tracking-[-0.03em] sm:text-4xl">
        Best offers — {category?.name ?? categorySlug}
      </h2>
      <div className="mt-6 grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
        {isLoading
          ? Array.from({ length: 4 }).map((_, index) => (
              <Skeleton key={index} className="aspect-[3/4] w-full" />
            ))
          : offers.map((product) => <ProductCard key={product.id} product={product} />)}
      </div>
    </section>
  );
}
```

### `src/features/products/components/general-products.tsx` (unwrap `.items`)

```tsx
"use client";

import { Skeleton } from "@/components/ui/skeleton";
import { useProductsQuery } from "../hooks/use-products";
import { ProductCard } from "./product-card";

type GeneralProductsProps = {
  readonly categorySlug: string;
  readonly title: string;
};

export function GeneralProducts({ categorySlug, title }: GeneralProductsProps) {
  const { data, isLoading } = useProductsQuery({ categorySlug });
  const products = data?.items ?? [];

  if (!isLoading && products.length === 0) {
    return null;
  }

  return (
    <section className="mx-auto max-w-6xl px-4 py-10 sm:px-6">
      <h2 className="text-3xl font-semibold tracking-[-0.03em] sm:text-4xl">{title}</h2>
      <div className="mt-6 grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
        {isLoading
          ? Array.from({ length: 4 }).map((_, index) => (
              <Skeleton key={index} className="aspect-[3/4] w-full" />
            ))
          : products.map((product) => <ProductCard key={product.id} product={product} />)}
      </div>
    </section>
  );
}
```

`product-pagination.tsx` and `price-range-filter.tsx` are unchanged — they only deal in page
numbers and price query params, never the product shape.

## 10. Pages

### `app/product/[slug]/page.tsx` — swap client-side slicing for server-side `skip`/`limit`

Only the data-fetching block changes; JSX is unchanged except `resolvePage` → `resolveProductPage`.

```tsx
import Link from "next/link";
import { notFound } from "next/navigation";

import { SiteFooter } from "@/components/layout/site-footer";
import { SiteHeader } from "@/components/layout/site-header";
import { CategoryPill } from "@/src/features/categories/components/category-pill";
import {
  getCategoryById,
  getCategoryBySlug,
  getChildCategories,
} from "@/src/features/categories/lib/category-helpers";
import { fetchProducts } from "@/src/features/products/api/product-api";
import { ProductCard } from "@/src/features/products/components/product-card";
import { ProductPagination } from "@/src/features/products/components/product-pagination";
import { PriceRangeFilter } from "@/src/features/products/components/price-range-filter";
import { resolveProductPage } from "@/src/features/products/lib/pagination-helpers";
import { PRICE_FILTER_MAX, PRICE_FILTER_MIN, parsePriceParam } from "@/src/features/products/lib/price-filter";

const PAGE_SIZE = 8;

type CategoryPageProps = {
  readonly params: Promise<{ slug: string }>;
  readonly searchParams: Promise<{ category?: string; page?: string; minPrice?: string; maxPrice?: string }>;
};

export default async function CategoryPage({ params, searchParams }: CategoryPageProps) {
  const { slug } = await params;
  const {
    category: categoryParam,
    page: pageParam,
    minPrice: minPriceParam,
    maxPrice: maxPriceParam,
  } = await searchParams;
  const category = getCategoryBySlug(slug);

  if (!category) {
    notFound();
  }

  const minPrice = parsePriceParam(minPriceParam, PRICE_FILTER_MIN);
  const maxPrice = parsePriceParam(maxPriceParam, PRICE_FILTER_MAX);
  const parent = category.parentId ? getCategoryById(category.parentId) : null;
  const children = getChildCategories(category.id);
  const activeChild =
    categoryParam && categoryParam !== "all"
      ? children.find((child) => child.slug === categoryParam)
      : undefined;

  const { items: products, currentPage, totalPages } = await resolveProductPage(
    (skip, limit) =>
      fetchProducts({
        categorySlug: activeChild?.slug ?? slug,
        minPrice,
        maxPrice,
        skip,
        limit,
      }),
    pageParam,
    PAGE_SIZE,
  );

  return (
    <div className="flex min-h-full flex-1 flex-col">
      <SiteHeader />

      <main className="mx-auto w-full max-w-6xl flex-1 px-4 py-10 sm:px-6">
        <nav className="text-sm text-muted-foreground" aria-label="Breadcrumb">
          <Link href="/" className="hover:text-foreground">
            Home
          </Link>
          {parent && (
            <>
              {" / "}
              <Link href={`/product/${parent.slug}`} className="hover:text-foreground">
                {parent.name}
              </Link>
            </>
          )}
          {" / "}
          <span className="text-foreground">{category.name}</span>
        </nav>

        <h1 className="mt-2 text-3xl font-semibold tracking-[-0.03em] sm:text-4xl">
          {category.name}
        </h1>

        <div className="mt-4 flex flex-wrap items-center justify-between gap-4">
          {children.length > 0 ? (
            <div className="flex flex-wrap gap-2">
              <CategoryPill
                href={buildPageHref(slug, undefined, minPrice, maxPrice)}
                label="All"
                active={!activeChild}
              />
              {children.map((child) => (
                <CategoryPill
                  key={child.id}
                  href={buildPageHref(slug, child.slug, minPrice, maxPrice)}
                  label={child.name}
                  active={activeChild?.id === child.id}
                />
              ))}
            </div>
          ) : (
            <div />
          )}

          <PriceRangeFilter
            minPrice={minPrice}
            maxPrice={maxPrice}
            basePath={`/product/${slug}`}
            params={{ category: activeChild?.slug }}
          />
        </div>

        <div className="mt-8 grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
          {products.length > 0 ? (
            products.map((product) => <ProductCard key={product.id} product={product} />)
          ) : (
            <p className="col-span-full text-sm text-muted-foreground">
              No products in this category yet.
            </p>
          )}
        </div>

        {totalPages > 1 && (
          <ProductPagination
            currentPage={currentPage}
            totalPages={totalPages}
            buildHref={(page) => buildPageHref(slug, activeChild?.slug, minPrice, maxPrice, page)}
          />
        )}
      </main>

      <SiteFooter />
    </div>
  );
}

function buildPageHref(
  slug: string,
  categoryParam: string | undefined,
  minPrice: number,
  maxPrice: number,
  page?: number,
): string {
  const params = new URLSearchParams();
  if (categoryParam) {
    params.set("category", categoryParam);
  }
  if (minPrice !== PRICE_FILTER_MIN) {
    params.set("minPrice", String(minPrice));
  }
  if (maxPrice !== PRICE_FILTER_MAX) {
    params.set("maxPrice", String(maxPrice));
  }
  if (page && page > 1) {
    params.set("page", String(page));
  }
  const query = params.toString();
  return `/product/${slug}${query ? `?${query}` : ""}`;
}
```

### `app/search/page.tsx` — same pattern, guarded by whether a query was entered

```tsx
import { SiteFooter } from "@/components/layout/site-footer";
import { SiteHeader } from "@/components/layout/site-header";
import { CategoryPill } from "@/src/features/categories/components/category-pill";
import { getTopLevelCategories } from "@/src/features/categories/lib/category-helpers";
import { fetchProducts } from "@/src/features/products/api/product-api";
import { ProductCard } from "@/src/features/products/components/product-card";
import { ProductPagination } from "@/src/features/products/components/product-pagination";
import { PriceRangeFilter } from "@/src/features/products/components/price-range-filter";
import { resolveProductPage } from "@/src/features/products/lib/pagination-helpers";
import { PRICE_FILTER_MAX, PRICE_FILTER_MIN, parsePriceParam } from "@/src/features/products/lib/price-filter";

const PAGE_SIZE = 8;

type SearchPageProps = {
  readonly searchParams: Promise<{
    q?: string;
    category?: string;
    page?: string;
    minPrice?: string;
    maxPrice?: string;
  }>;
};

export default async function SearchPage({ searchParams }: SearchPageProps) {
  const {
    q,
    category: categorySlug,
    page: pageParam,
    minPrice: minPriceParam,
    maxPrice: maxPriceParam,
  } = await searchParams;
  const query = q?.trim() ?? "";
  const minPrice = parsePriceParam(minPriceParam, PRICE_FILTER_MIN);
  const maxPrice = parsePriceParam(maxPriceParam, PRICE_FILTER_MAX);
  const topLevelCategories = getTopLevelCategories();

  const { items: products, currentPage, totalPages } = query
    ? await resolveProductPage(
        (skip, limit) => fetchProducts({ query, categorySlug, minPrice, maxPrice, skip, limit }),
        pageParam,
        PAGE_SIZE,
      )
    : { items: [], currentPage: 1, totalPages: 1 };

  return (
    <div className="flex min-h-full flex-1 flex-col">
      <SiteHeader />

      <main className="mx-auto w-full max-w-6xl flex-1 px-4 py-10 sm:px-6">
        <h1 className="text-3xl font-semibold tracking-[-0.03em] sm:text-4xl">
          {query ? `Search results for "${query}"` : "Search"}
        </h1>

        <div className="mt-4 flex flex-wrap items-center justify-between gap-4">
          <div className="flex flex-wrap gap-2">
            <CategoryPill
              href={buildSearchHref(query, { minPrice, maxPrice })}
              label="All"
              active={!categorySlug}
            />
            {topLevelCategories.map((category) => (
              <CategoryPill
                key={category.id}
                href={buildSearchHref(query, { category: category.slug, minPrice, maxPrice })}
                label={category.name}
                active={categorySlug === category.slug}
              />
            ))}
          </div>

          <PriceRangeFilter
            minPrice={minPrice}
            maxPrice={maxPrice}
            basePath="/search"
            params={{ q: query, category: categorySlug }}
          />
        </div>

        <div className="mt-8 grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
          {!query ? (
            <p className="col-span-full text-sm text-muted-foreground">
              Enter a search term to find products.
            </p>
          ) : products.length > 0 ? (
            products.map((product) => <ProductCard key={product.id} product={product} />)
          ) : (
            <p className="col-span-full text-sm text-muted-foreground">
              No products found for &quot;{query}&quot;.
            </p>
          )}
        </div>

        {totalPages > 1 && query && (
          <ProductPagination
            currentPage={currentPage}
            totalPages={totalPages}
            buildHref={(page) =>
              buildSearchHref(query, { category: categorySlug, minPrice, maxPrice, page })
            }
          />
        )}
      </main>

      <SiteFooter />
    </div>
  );
}

function buildSearchHref(
  query: string,
  options: { category?: string; minPrice: number; maxPrice: number; page?: number },
): string {
  const params = new URLSearchParams();
  if (query) {
    params.set("q", query);
  }
  if (options.category) {
    params.set("category", options.category);
  }
  if (options.minPrice !== PRICE_FILTER_MIN) {
    params.set("minPrice", String(options.minPrice));
  }
  if (options.maxPrice !== PRICE_FILTER_MAX) {
    params.set("maxPrice", String(options.maxPrice));
  }
  if (options.page && options.page > 1) {
    params.set("page", String(options.page));
  }
  const qs = params.toString();
  return `/search${qs ? `?${qs}` : ""}`;
}
```

### `app/product/[slug]/[productId]/page.tsx` — `fetchProductById` now returns `ProductDetail`; `.name`→`.title`; unwrap `.items`

```tsx
import Link from "next/link";
import { notFound } from "next/navigation";

import { SiteFooter } from "@/components/layout/site-footer";
import { SiteHeader } from "@/components/layout/site-header";
import { getCategoryById } from "@/src/features/categories/lib/category-helpers";
import { fetchProductById, fetchProducts } from "@/src/features/products/api/product-api";
import { ProductCard } from "@/src/features/products/components/product-card";
import { ProductDetail } from "@/src/features/products/components/product-detail";

type ProductDetailPageProps = {
  readonly params: Promise<{ slug: string; productId: string }>;
};

export default async function ProductDetailPage({ params }: ProductDetailPageProps) {
  const { productId } = await params;
  const id = Number(productId);

  if (!Number.isInteger(id)) {
    notFound();
  }

  const product = await fetchProductById(id);

  if (!product) {
    notFound();
  }

  const category = getCategoryById(product.categoryId);
  const parent = category?.parentId ? getCategoryById(category.parentId) : null;

  const related = category
    ? (await fetchProducts({ categorySlug: category.slug })).items
        .filter((item) => item.id !== product.id)
        .slice(0, 4)
    : [];

  const broaderCategory = parent ?? category;
  const excludedIds = new Set([product.id, ...related.map((item) => item.id)]);
  const otherProducts = broaderCategory
    ? (await fetchProducts({ categorySlug: broaderCategory.slug })).items
        .filter((item) => !excludedIds.has(item.id))
        .slice(0, 4)
    : [];

  return (
    <div className="flex min-h-full flex-1 flex-col">
      <SiteHeader />

      <main className="mx-auto w-full max-w-6xl flex-1 px-4 py-10 sm:px-6">
        <nav className="text-sm text-muted-foreground" aria-label="Breadcrumb">
          <Link href="/" className="hover:text-foreground">
            Home
          </Link>
          {parent && (
            <>
              {" / "}
              <Link href={`/product/${parent.slug}`} className="hover:text-foreground">
                {parent.name}
              </Link>
            </>
          )}
          {category && (
            <>
              {" / "}
              <Link href={`/product/${category.slug}`} className="hover:text-foreground">
                {category.name}
              </Link>
            </>
          )}
          {" / "}
          <span className="text-foreground">{product.title}</span>
        </nav>

        <ProductDetail product={product} categoryName={category?.name ?? ""} />

        {related.length > 0 && (
          <section className="mt-16">
            <h2 className="text-2xl font-semibold tracking-[-0.03em]">You might also like</h2>
            <div className="mt-6 grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
              {related.map((item) => (
                <ProductCard key={item.id} product={item} />
              ))}
            </div>
          </section>
        )}

        {otherProducts.length > 0 && (
          <section className="mt-16">
            <h2 className="text-2xl font-semibold tracking-[-0.03em]">Other products you may like</h2>
            <div className="mt-6 grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
              {otherProducts.map((item) => (
                <ProductCard key={item.id} product={item} />
              ))}
            </div>
          </section>
        )}
      </main>

      <SiteFooter />
    </div>
  );
}
```

## 11. Cart / checkout consumers — swap raw `products` for the precomputed `productSummaries`, rename `.name`→`.title`

Three files do a synchronous `getProductById(products, id)` lookup outside React Query. Only the
import and field name change; everything else is untouched.

### `src/features/cart/components/cart-sheet.tsx`

```diff
- import { products } from "@/src/features/products/data/products.data";
+ import { productSummaries } from "@/src/features/products/data/product-catalog";
  import { getDiscountedPrice, getProductById } from "@/src/features/products/lib/product-helpers";
- import type { Product } from "@/src/features/products/types/product";
+ import type { ProductSummary } from "@/src/features/products/types/product";
  ...
- type CartLine = { item: CartItem; product: Product };
+ type CartLine = { item: CartItem; product: ProductSummary };
  ...
  const lines: CartLine[] = items.flatMap((item) => {
-     const product = getProductById(products, item.productId);
+     const product = getProductById(productSummaries, item.productId);
      return product ? [{ item, product }] : [];
  });
```

Plus every `product.name` → `product.title` (image `alt`, item title, remove-button `aria-label`),
and the hardcoded `<Image src="/image.png" .../>` → `<Image src={product.thumbnailUrl} .../>`.

### `src/features/checkout/components/order-summary.tsx`

```diff
- import { products } from "@/src/features/products/data/products.data";
+ import { productSummaries } from "@/src/features/products/data/product-catalog";
  ...
  const lines = items.flatMap((item) => {
-     const product = getProductById(products, item.productId);
+     const product = getProductById(productSummaries, item.productId);
      return product ? [{ item, product }] : [];
  });
```

Plus `product.name` → `product.title` in the line-item label.

### `src/features/checkout/components/checkout-form.tsx`

```diff
- import { products } from "@/src/features/products/data/products.data";
+ import { productSummaries } from "@/src/features/products/data/product-catalog";
  ...
  const lines = items.flatMap((item) => {
-     const product = getProductById(products, item.productId);
+     const product = getProductById(productSummaries, item.productId);
      return product
          ? [
              {
                  productId: product.id,
-                 name: product.name,
+                 name: product.title,
                  size: item.size,
                  quantity: item.quantity,
                  unitPrice: getDiscountedPrice(product),
              },
            ]
          : [];
  });
```

---

## Files touched — summary

**New**
- `src/features/products/mappers/product-mappers.ts`
- `src/features/products/data/product-variants.data.ts`
- `src/features/products/data/product-images.data.ts`
- `src/features/products/data/product-catalog.ts`

**Rewritten**
- `src/features/products/types/product.ts`
- `src/features/products/data/products.data.ts`
- `src/features/products/lib/product-helpers.ts`
- `src/features/products/lib/query-keys.ts`
- `src/features/products/api/product-api.ts`
- `src/features/products/hooks/use-products.ts`
- `src/features/products/components/product-card.tsx`
- `src/features/products/components/product-detail.tsx`
- `src/features/products/components/best-offers.tsx`
- `src/features/products/components/general-products.tsx`
- `app/product/[slug]/page.tsx`
- `app/search/page.tsx`
- `app/product/[slug]/[productId]/page.tsx`

**Small edits (field renames + import swap only)**
- `src/features/products/lib/pagination-helpers.ts` (add `resolveProductPage`, keep `getPageRange`; `resolvePage` is dropped, no longer called anywhere)
- `src/features/cart/components/cart-sheet.tsx`
- `src/features/checkout/components/order-summary.tsx`
- `src/features/checkout/components/checkout-form.tsx`

**Unchanged**
- `src/features/products/components/product-pagination.tsx`
- `src/features/products/components/price-range-filter.tsx`
- `src/features/products/lib/price-filter.ts`
- `src/features/products/components/product-icon.tsx` (currently unused by these two components — still available if a future card variant wants an icon fallback instead of `thumbnailUrl`)
