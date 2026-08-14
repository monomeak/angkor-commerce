# Angkor Commerce — Work Report, 14 Aug 2026

> Recap of one working session across all three apps. The headline is that
> **`apps/customer-portal` now reads its catalogue from `apps/core-api`** — products,
> categories, product detail and variants — which required a small backend change to make
> category browsing work at all.
>
> **Reported:** 2026-08-14, branch `feature/web-catalog-products`.
> **Committed:** back-office only (`adccfc3`). core-api and customer-portal changes are
> still in the working tree.

| App | Files | State |
|---|---|---|
| `apps/back-office-portal` | 7 | Committed as `adccfc3` |
| `apps/core-api` | 7 modified | Uncommitted |
| `apps/customer-portal` | 24 modified, 12 new | Uncommitted |

---

## 1. `apps/back-office-portal` — two defects on the product create screen

Both surfaced as console errors on `/catalog/products/new`. Committed together as
`adccfc3` (7 files, +40/−18).

### Base UI buttons that render a `Link`

Base UI's `Button` defaults `nativeButton` to `true`, so `<Button render={<Link/>}>`
rendered an `<a>` while the library applied native-button handling (`type="button"`) and
skipped its non-native path. Not only a warning: with `nativeButton={false}`, `useButton`
detects a valid link and steps out of the way of the anchor's own Enter/Space activation.

Fixed in six places — the product form's cancel button, the create and edit back arrows,
the products-view and empty-state add buttons, and the unauthorized page. The form's
cancel also lost its `type="button"`, which is meaningless on an anchor.

The convention already existed in ~15 places under `components/home/` and in
customer-portal; the catalogue feature simply missed it when it landed.

### Sidebar hydration mismatch

`useIsMobile` read the viewport synchronously in a lazy `useState` initializer:

```ts
const [isMobile, setIsMobile] = React.useState(() =>
  typeof window === "undefined" ? false : window.matchMedia(...).matches
)
```

That initializer runs on the **hydration** render, not after it. On a narrow viewport the
server had already committed `false` and rendered `<Sidebar>`'s desktop branch, while the
client immediately computed `true` and rendered the `Sheet` branch — a whole subtree
present on the server and absent on the client.

Rewritten with `useSyncExternalStore`, whose `getServerSnapshot` pins the hydration render
to `false` and re-reads immediately after. A phone still gets the mobile Sheet, one render
later; desktop settles in a single render rather than the extra pass the stock
effect-based version costs.

> `apps/customer-portal/hooks/use-mobile.ts` still has the original shadcn version. It is
> SSR-safe, so it has no hydration bug — it just costs an extra render pass. Left alone.

---

## 2. `apps/core-api` — category subtree filtering, and richer list rows

Three changes, all needed before the storefront could browse. `./mvnw compile` clean.

### Products now filter by the category *subtree*

`ProductSpecification` matched the category exactly. Products only ever hang off leaf
categories, so `?categorySlug=men` returned almost nothing — and every top-level browse
page in the storefront is a parent category.

- `CategoryService.getDescendantCategoryIds` — walks the tree in memory (categories are
  the small, unpaginated exception; a couple of dozen rows).
- `CategoryRepository.findBySlug` — storefront URLs carry the slug, not the id.
- `ProductSpecification.from(query, categoryIds)` — the predicate became `categoryIn`.
  Resolution lives in the service, since the specification is static and has no repository.
- `ProductServiceImpl.resolveCategoryFilter` — three deliberately distinct outcomes:
  `null` (no filter asked for), empty list (asked for, matched no category → returns an
  empty page), populated list (the category and its descendants).

The empty case matters: falling through with an empty id list would have dropped the
predicate and listed the whole catalogue.

**Verified against the running API:** `?categorySlug=men` returns 6 products spanning
`men`, `men-shirt`, `men-pants`, `men-krama` and `men-shoes` — previously only the 2
sitting directly on "Men". An unknown slug returns 0, not everything.

### `ProductSummaryResponse` gained three fields

`description`, `categoryId`, `categorySlug`. A storefront card links to
`/product/{categorySlug}/{id}`, and the flattened category *name* could not be resolved
back to a category — names repeat across the tree, with Men, Women and Children each
having a "Shoes".

### Effect on the back office

Its category filter now spans subtrees too, which is the more useful behaviour. Its Zod
schema strips the three new fields harmlessly, so nothing there needed changing.

---

## 3. `apps/customer-portal` — the catalogue on core-api

Uses the **shared** `GET /products` and `GET /categories`; the `/storefront/products`
controller in `docs/api-design-draft/PRODUCT_API_DESIGN.md` was never built. Both are
`permitAll` for GET, so browsing needs no session.

### Data layer

New `schemas/` (wire DTOs), `types/`, `mappers/` and rewritten `api/` for both features,
plus React Query hooks and query keys. Category helpers became **pure functions over a
passed-in list** — a server component awaits `fetchCategories()`, a client component reads
`useCategories()`, and neither is reachable from inside a helper that imports mock data.
Screens still on mock data now pass `categories` explicitly, which makes the remaining
mock dependency visible at the call site.

List rows and the detail record are modelled separately as `ProductSummary` and `Product`,
because the API genuinely returns different shapes.

### Screens

| Screen | Rendering | Source |
|---|---|---|
| Home rows (best offers, category teasers) | Client, React Query | `GET /products` |
| Category browse `/product/[slug]` | Server | `GET /products` + `GET /categories` |
| Search `/search` | Server | `GET /products?q=` |
| Product detail `/product/[slug]/[id]` | Server | `GET /products/{id}` |
| Site header / footer / category section | Header client, rest server | `GET /categories` |

Category and search pages are indexable, so their products belong in the HTML rather than
behind a loading skeleton. Paging and filtering moved onto the API — they used to fetch
every product and slice the array.

### Variants

Size, stock and SKU live on variants, never on the product. The detail page selects a
variant and reads price, stock and the cart line from it; sold-out sizes are disabled, and
the default selection is the first variant actually in stock. The size picker hides only
when the sole variant has no size at all.

The product card **lost its size picker and add-to-cart**. Those sizes were guessed from
the category name, and a list row carries only `variantCount`, not variants — quick-add
would have booked a size that may not exist as a SKU. The card now shows
"Choose from N sizes" / "View product" and links to detail.

### Three behavioural corrections

- **Storefront sends `status=active`.** The API's default only excludes `deleted`, which is
  right for the back office and would have leaked off-sale products to shoppers.
- **Price bounds are only sent when moved.** The slider's 5–100 ends are the widget's
  range, not real limits. Forwarding them untouched was harmless against mock data priced
  inside that range, and would have hidden most of a real catalogue — all of one priced in
  KHR. One remaining difference: core-api compares the base price, the old in-memory filter
  compared the discounted price.
- **`apiFetch` was silently dropping Next fetch options.** It builds a `Request`, whose
  constructor discards the non-standard `next` property, so `revalidate` never applied and
  the home page baked its categories in at build time. Now passed in `fetch`'s second
  argument. `fetchCategories` sets `revalidate: 300`, and the build reports a 5m window on
  the static routes.

### Generated placeholder images

Most of the catalogue has no photography, so the fallback is the common case rather than an
error case. One shared `/image.png` made a grid look like the same item repeated, so
`lib/product-image.ts` now generates a watermark tile per product — its initials over the
shop wordmark, as an inline SVG data URI.

- Derived only from the product name, so server and client agree; anything random would be
  a hydration mismatch.
- Paints no background, so the themed container supplies light/dark.
- Initials are stripped to `\p{L}\p{N}`, so nothing can break the markup. Khmer script
  works (`សំពត់` → `ស`); an empty name falls back to `AC`.
- Needs `<Image unoptimized>` — Next's optimiser cannot handle data URIs.

Real thumbnails still win: on `/product/men`, products 2 and 12 use their MinIO images and
the other four get distinct watermarks.

### Empty states

Ported shadcn's `Empty` primitive from back-office (same `base-nova` registry). The
substance is not the icons — one grey sentence was covering two different situations, and
only one of them is the shopper's to fix.

| Situation | Message | Action |
|---|---|---|
| Category genuinely empty | Nothing here yet | Back to the shop |
| Price filter excluded everything | No products in this price range | Clear price filter |
| Search found nothing | No matches for "X" + spelling hint | Browse the shop |
| Search, nothing typed | Search the shop | — (a prompt, not a failure) |

The reset link appears only when a filter is actually responsible, via `isPriceFiltered()`.

---

## 4. Verification

| Check | Result |
|---|---|
| `./mvnw compile` (core-api) | Clean |
| `tsc --noEmit` (both portals) | Clean |
| `next build` (customer-portal) | Clean; ISR reported at 5m on static routes |
| `eslint` (customer-portal) | 7 errors, all pre-existing `set-state-in-effect` in untouched files |
| Live API | Subtree filter, new DTO fields, variants, empty-slug guard |
| Rendered pages | Category, search, detail, all four empty states, watermark fallback |

---

## 5. Open items

**1. The cart is broken, and it is a regression from this work.** The cart resolves product
ids against `products.data.ts`, but the detail page now passes real API ids. They overlap
without matching — real id 2 is "Men's Classic Polo Shirt", mock id 2 is "Everyday Men
T-Shirt" — and real ids like 22 do not exist in the mock data at all, so the line silently
disappears. core-api has no cart endpoint, so the fix is to resolve cart lines through
`GET /products/{id}`; it touches `cart-sheet`, `order-summary` and `checkout-form`. **This
is the next thing to do.**

**2. `next build` now needs core-api reachable.** The ISR routes prerender at build time.
If CI cannot reach the API, those routes need `force-dynamic` instead.

**3. Still on mock/localStorage:** cart, checkout, orders, favorites, payment methods, and
the saved shipping address.

**4. `apps/customer-portal/public/image.png` is now unused.** Left on disk rather than
deleting an asset that may be wanted elsewhere.

**5. Two commits still to make** — one for core-api, one for customer-portal.
