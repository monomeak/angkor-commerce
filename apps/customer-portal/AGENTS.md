<!-- BEGIN:nextjs-agent-rules -->
# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` before writing any code. Heed deprecation notices.
<!-- END:nextjs-agent-rules -->

# Angkor Commerce — apps/customer-portal

Public storefront for Angkor Commerce: browsing, self-registration, and order/invoice viewing against the shared `apps/core-api` backend. See [`docs/ANGKOR_COMMERCE_PROJECT_PROPOSAL.md`](../../docs/ANGKOR_COMMERCE_PROJECT_PROPOSAL.md) for overall design intent, [`docs/CORE_API_DATA_MODEL.md`](../../docs/CORE_API_DATA_MODEL.md) for the storefront data model, and [`docs/NEXTJS_MIGRATION_PLAN.md`](../../docs/NEXTJS_MIGRATION_PLAN.md) at the repo root for the phased migration plan — treat them as the source of truth over this file for anything not covered here.

## Stack

Next.js 16 App Router, React 19, TypeScript 5, Tailwind CSS 4, shadcn/ui (`base-nova` style, neutral base color — matches `apps/back-office-portal`), TanStack React Query 5, Zod 4, Leaflet + react-leaflet (the address map picker, and the only place either is used). Auth, the customer profile, the product catalogue, the address book and the wishlist talk to `apps/core-api`; the cart, checkout and orders are still local mock/localStorage data.

## Structure and conventions

Mirrors `apps/back-office-portal`:

- Routes live in `app/`; feature code lives in `src/features/<feature>/` using the same folder set as `apps/back-office-portal`: `api/`, `components/`, `data/`, `hooks/`, `lib/`, `schemas/`, `types/`, `views/` (plus `mappers/` once an API response shape needs mapping). Keep `app` and `src` separate.
- Zod schemas belong in `schemas/<name>.schema.ts`, not in `lib/`. `lib/` is for helpers, contexts, storage adapters, and query keys.
- Route pages compose feature views and stay small; feature logic lives in the feature folder. A page that does more than assemble the site chrome around a view has logic in the wrong place — see `products/views/search-view.tsx`.
- Query keys are owned by the feature that defines them (`src/features/<feature>/lib/query-keys.ts`).
- Providers live in `components/providers/` and are composed by `providers.tsx`, which the root layout renders with the server-built config. Theme is a hand-rolled context (`theme-provider.tsx`), not `next-themes` — follow that pattern rather than reaching for the `next-themes` package.
- TanStack Query provider/devtools: `components/providers/query-client-providers.tsx`, gated on `AppConfig.environment`.
- Forms use local React state + Zod; React Hook Form and the shadcn `Form` component are not installed — don't add them without checking whether that decision has changed.
- Every API call goes through `apiFetch` in `lib/api-client.ts` (`credentials: "include"`, one refresh-and-replay on 401, `ApiError` with the API's field errors). Don't call `fetch` against core-api directly.
- Validate every core-api response with `parseResponse(schema, data)` from the same file before it reaches domain code — it throws `ApiError(502)` and logs the failing fields in dev. Don't hand-roll `safeParse` in a feature's `api/` module.
- Config reaches the browser the same way as in `apps/back-office-portal`: `lib/env.ts` parses `process.env` on the server, `lib/app-config.server.ts` narrows it to the public `AppConfig` shape, and `<AppConfigProvider>` publishes it. Nothing uses `NEXT_PUBLIC_*`, so the same build runs in every environment. See `.env.example`.
- `AppConfig` is only readable from a hook, so `apiFetch` and `resolveMediaUrl` take `apiBaseUrl`/`mediaBaseUrl` as their first argument: the hook calls `useAppConfig()` and passes it to the feature's api function. Don't reach for a module-level base URL, and never call `useAppConfig()` outside a component or hook.

## Auth

The storefront browser calls core-api directly — there is no BFF/proxy layer. core-api owns the session in **httpOnly cookies** (`accessToken` 15 min, `refreshToken` 10 days, set by `AuthCookieService` on the API origin), so:

- Next middleware and server components cannot see the session. `GET /storefront/auth/me` is the only source of truth, exposed as `useCurrentCustomer()` — `null` means anonymous, `undefined` means not resolved yet.
- Route protection is the client-side `RequireCustomer` guard (`src/features/auth/components/require-customer.tsx`) wrapped around `app/account/layout.tsx`, not `proxy.ts`.
- Login, register and logout all go through `resetSessionCache` (`auth/lib/session-cache.ts`), which clears the **whole** query cache before installing the new customer. Customer-scoped caches otherwise outlive the session and get handed to whoever signs in next. `/login` and `/signup` are reachable while signed in, so they are session boundaries too.
- Both logout controls (header icon, account nav row) confirm first via `LogoutConfirmDialog` and go through `useLogoutAndLeave`, which navigates home *before* dropping the session — otherwise `RequireCustomer` wins the race and bounces to `/login`.
- The 15-minute access token makes refresh-and-replay on 401 routine, not exceptional; it's handled once inside `apiFetch`.
- Signed-in customer state lives in the TanStack Query cache under `authKeys.currentCustomer()`. Mutations write to that key rather than to a parallel context.
- `CurrentCustomerResponse.image` is a raw MinIO **object key**, unlike the staff `UserMapper` which resolves it — `lib/media.ts` builds the public URL.

## Catalogue

Products and categories come from core-api's **shared** `GET /products` and `GET /categories`, not a storefront-specific route — the `/storefront/products` controller in `docs/api-design-draft/PRODUCT_API_DESIGN.md` was never built. Both are `permitAll` for GET, so browsing needs no session.

- The storefront always sends `status=active`. The API's default only excludes `deleted`, which is right for the back office and would leak off-sale products here.
- `categorySlug` matches the category **and its descendants** (`CategoryService.getDescendantCategoryIds`), so `/product/men` lists the whole subtree. Products only ever hang off leaf categories, so exact matching returned nothing.
- List rows (`ProductSummaryResponse`) and the detail record (`ProductResponse`) are genuinely different shapes, modelled separately as `ProductSummary` and `Product`. A list row has no variants — only `variantCount` — which is why sizes are chosen on the detail page and a card just links there.
- Size, stock and SKU live on **variants**, never on the product. A product's `price` is the lowest effective variant price and its `totalStock` is the sum; what a shopper pays comes from the selected variant.
- Images are MinIO object keys. `lib/product-image.ts` resolves them and, when a product has none — the common case while the catalogue is unphotographed — generates a watermark tile instead: the product's initials over the shop wordmark, as an inline SVG data URI. It is derived only from the product name (so server and client agree) and paints no background (so the themed container behind it supplies light/dark). Pass it to `<Image unoptimized>`; Next's optimiser cannot handle data URIs.
- Empty grids are `components/product-empty-states.tsx`, which distinguishes "this category has nothing" from "your price filter excluded everything" and offers a reset link only in the second case.
- Category and search pages fetch on the server (indexable, so products belong in the HTML); the home-page rows use React Query. Server components read `getAppConfig().apiBaseUrl` directly rather than `useAppConfig()`.
- `fetchCategories` sets `next: { revalidate: 300 }`, which makes every otherwise-static route ISR. Note this means `next build` needs core-api reachable — those routes prerender at build time.

## Addresses

`src/features/addresses/` owns the whole address book against `/storefront/addresses`. Nothing address-shaped lives under `account/` anymore — the old localStorage `AddressProviderConfig` is gone, and the account page just renders `<AddressBook />`.

- The API caps a customer at **3** addresses and keeps exactly one default. The client mirrors the cap (`MAX_SAVED_ADDRESSES`) to disable the add button, but the rules are the API's: every mutation invalidates `addressKeys.list()` rather than patching the cache, because deleting the default promotes another row and the list is ordered default-first.
- `useAddressesQuery` is gated on `useCurrentCustomer()` — checkout renders this for anonymous shoppers, where the call would be a guaranteed 401.
- Fields are Cambodian, not the old `{address, city}` mock: `line1` is house + street, `commune` the sangkat, `district` the khan, `province` the khaet. `PATCH` sends every field, so blanking an optional one clears it server-side.
- The form has a **map picker** (`components/map-picker.tsx`, reusable and address-agnostic — it only emits coordinates). Click drops a pin, dragging moves it, and each drop reverse-geocodes through OpenStreetMap's Nominatim to fill the address fields; whatever the lookup can't name keeps what was typed. `latitude`/`longitude` are saved with the address as a pair. That fetch is the one call in the portal that deliberately skips `apiFetch` — it isn't core-api, and session cookies have no business going there.
- Leaflet touches `window` on import, so `map-canvas.tsx` (the react-leaflet part, plus `leaflet/dist/leaflet.css`) is only ever loaded through `next/dynamic` with `ssr: false` from `map-picker.tsx`. Import the picker, never the canvas.
- Checkout does not manage addresses: `/shipping` offers the saved ones as fill-in buttons and flattens the chosen one into its mock `ShippingAddress` through `checkout/lib/saved-address.ts`. That adapter is lossy on purpose and should be deleted once `POST /storefront/orders` accepts an `addressId`.

## Wishlist (favorites)

`src/features/wishlist/` owns everything saved-for-later against `/storefront/my-wishlist`. The UI calls it "favorites" (the account route is `/account/favorites`) and the API calls it the wishlist; the feature folder follows the API.

- The heart is one component, `components/wishlist-button.tsx`, used by the product grid and the detail page. Saved state is **not** a prop: every heart reads the same cached id list (`GET /my-wishlist/product-ids`, a projection query added for exactly this), so saving on a detail page fills the heart on the grid behind it.
- Saving keys on the **product**, not the variant — so the heart is unaffected by the size picker and stays live on a sold-out product.
- The id list is patched optimistically and rolled back on failure; the item list never is, because it shows prices, stock and a saved date the client would have to invent. Both are invalidated on settle.
- `useWishlistProductIds` returns `[]` unless `/me` says somebody is signed in. A disabled query still hands back what it cached, so `data ?? []` would leave hearts filled after a logout — and `resetSessionCache` (auth) clears the whole cache on every session boundary for the same reason.
- An anonymous tap is a sign-in prompt (`/login?next=…`), not a request — the endpoints are customer-scoped and would 401.
- The API answers **409** for a product already saved and **404** for removing one that isn't; `api/wishlist-api.ts` swallows both, because neither is something the shopper did wrong.
- A saved product can outlive its place in the catalogue, so the row carries `productStatus` and the card greys out and drops its link rather than routing to a 404. `categorySlug` is on the row for the same reason it is on a list row — the detail link needs it.
- `price` and `totalStock` are the same variant aggregates the catalogue grid shows, so a saved product does not appear to change price. The API loads them in one `aggragateByProductIds` call per page, alongside an entity graph over `product` + `product.category`.
- Paging is **9 per page** through `?page=` and the shared `ProductPagination`, so back/forward work and a page is linkable — but the rows are fetched client-side, since the session cookie is httpOnly on the API origin. That makes `/account/favorites` a dynamic route. Only the client knows the total, so `WishlistBoard` clamps a page past the end itself (removing the last item on the last page).
- `AppConfig.features.wishlist` exists but is still unread, like the rest of `features` — the wishlist is always on.

## Current state

Real backend integration covers auth, the customer profile, the catalogue, the address book and the wishlist: register/login/logout/refresh, `GET|PATCH /storefront/auth/me`, avatar upload via `PUT /storefront/auth/me/image`, product listing (landing rows, category browse, search), product detail with variants, address CRUD with a map pin, and saving/removing/clearing favorites.

Still mock/localStorage: cart, checkout, orders and payment methods — those land in later migration phases per `docs/api-design-draft/NEXTJS_MIGRATION_PLAN.md`. The cart holds product ids and resolves them against `products.data.ts`, so **its ids no longer line up with the real catalogue** — adding to the cart from a detail page books a line the cart sheet cannot resolve. That is the next thing to port.
