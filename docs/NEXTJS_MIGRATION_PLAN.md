# Next.js Migration Plan

This document prepares the current Vue 3 + Vite app for migration to Next.js, shadcn/ui, and TanStack Query.

## Target Stack

- Next.js App Router
- React with TypeScript
- Tailwind CSS
- shadcn/ui components
- TanStack Query v5 for async/server state
- A small client-side store or React context for purely local UI state, if needed

Important distinction: TanStack Query should own async/cacheable data such as products, account data, favorites, orders, cart data when API-backed, shipping, payment methods, and mutations. It should not be forced to own every local UI value. Search input, modal open states, selected tab, selected image, and selected size can stay in component state. If the cart remains local-only during migration, keep it in a local persisted client store first, then move it to TanStack Query when an API exists.

## Current App Summary

The current app is a frontend-only Khmer clothing storefront prototype. It has:

- 41 Vue/source files under `src`
- 6 Pinia store files
- 1 router file with nested product and user routes
- Static images under `public/images`
- Banner and video assets under `src/components`
- Product catalog mock data in `src/stores/product.js`
- Auth, account, favorites, and payment flows backed by `localStorage`, `sessionStorage`, and cookies

Current commands:

```sh
npm install
npm run dev
npm run build
npm run test:unit
```

## Current Routes to Preserve

| Current Vue route | Current file | Next.js App Router target |
| --- | --- | --- |
| `/` | `src/views/LandingPage.vue` | `app/page.tsx` |
| `/product` layout | `src/views/LayoutPage.vue` | `app/product/layout.tsx` |
| `/product/home` | `src/views/SubPages/Home.vue` | `app/product/home/page.tsx` |
| `/product/men` | `src/views/SubPages/MenClothes.vue` | `app/product/men/page.tsx` |
| `/product/women` | `src/views/SubPages/WomenClothes.vue` | `app/product/women/page.tsx` |
| `/product/children` | `src/views/SubPages/ChildrenClothes.vue` | `app/product/children/page.tsx` |
| `/product/cart` | `src/views/SubPages/ProductCart.vue` | `app/product/cart/page.tsx` |
| `/product/view/:id` | `src/views/SubPages/ProductDetailsLayout.vue` | `app/product/view/[id]/page.tsx` |
| `/shipping` | `src/views/ShippingPage.vue` | `app/shipping/page.tsx` |
| `/checkout` | `src/views/ProductCheckout.vue` | `app/checkout/page.tsx` |
| `/searchResults` | `src/views/searchResults.vue` | `app/searchResults/page.tsx` initially, with optional redirect from `/search-results` later |
| `/userpage/:id` layout | `src/views/UserPage/UserPage.vue` | `app/userpage/[id]/layout.tsx` |
| `/userpage/:id/account` | `src/views/UserPage/Account.vue` | `app/userpage/[id]/account/page.tsx` |
| `/userpage/:id/favorites` | `src/views/UserPage/Favorites.vue` | `app/userpage/[id]/favorites/page.tsx` |
| `/userpage/:id/orders` | `src/views/UserPage/Orders.vue` | `app/userpage/[id]/orders/page.tsx` |
| `/userpage/:id/payment-methods` | `src/views/UserPage/PaymentMethods.vue` | `app/userpage/[id]/payment-methods/page.tsx` |
| `/userpage/:id/change-password` | `src/views/UserPage/ChangePassword.vue` | `app/userpage/[id]/change-password/page.tsx` |
| `/login` | `src/views/Login.vue` | `app/login/page.tsx` |
| `/signup` | `src/views/Signup.vue` | `app/signup/page.tsx` |

## Current Feature Inventory

### Layout and Navigation

- `HeaderComponent.vue` owns top navigation, category dropdowns, search input, auth popup logic, account navigation, mobile hamburger state, and cart count.
- `LayoutPage.vue` wraps product pages with header, footer, and route loader.
- `App.vue` has global router outlet and another route loading mechanism.
- `SidebarMenu.vue` owns user account navigation and logout.

Migration notes:

- Convert header and sidebar to client components because they use browser state and navigation hooks.
- Use Next `Link` for route links and `useRouter` from `next/navigation` for imperative navigation.
- Replace route-level Vue loaders with `loading.tsx` files and shadcn `Skeleton` where useful.
- Avoid registering global navigation guards in components. Use App Router layouts and loading boundaries instead.

### Product Catalog

- Source: `src/stores/product.js`
- Shape: `productId`, `productName`, `productType`, `productGroup`, `productImages`, `description`, `quantity`, `rating`, `promotionPercentage`, `price`
- Getters: all products, products by type, products by type/group, best offers, best for today, Khmer traditional products
- Data is loaded by fake async `fetchProducts()` with a timeout.

Migration notes:

- Move product data to `src/lib/data/products.ts` or `src/features/products/products.data.ts`.
- Create product helpers for filtering and discounts.
- Add TanStack Query hooks:
  - `useProductsQuery()`
  - `useProductQuery(id)`
  - `useProductsByTypeQuery(type)`
  - `useProductsByTypeAndGroupQuery(type, group)`
- If there is no backend yet, query hooks can call local async functions. Keep the query API shaped like future HTTP calls.

### Cart

- Active store: `src/stores/cart.js`
- Duplicate store risk: `src/stores/cartStore.js` also defines a Pinia store with id `"cart"`.
- Cart item shape currently uses `id`, `name`, `image`, `price`, `size`, `quantity`, and `description`.
- Add-to-cart requires selected size and auth.
- Cart summary uses subtotal, 10% discount, and total.

Migration notes:

- Consolidate cart shape before migration.
- If no backend exists, use a client-only persisted cart hook first.
- If backend/API routes are added, expose cart through TanStack Query:
  - `useCartQuery()`
  - `useAddToCartMutation()`
  - `useRemoveFromCartMutation()`
  - `useUpdateCartQuantityMutation()`
  - `useClearCartMutation()`
- Keep cart count derived from cart items rather than duplicated state.

### Favorites

- Source: `src/stores/favorite.js`
- Storage: `localStorage` key `favorites`
- Favorite item shape differs from product shape: `id`, `name`, `description`, `imgSrc`, `rating`, `originalPrice`, `promotionPercentage`

Migration notes:

- Normalize favorite items to store only product ids when possible.
- If no backend exists, persist favorite ids client-side.
- If backend/API routes are added, use TanStack Query mutations and invalidate favorites/products queries.

### Search

- Source: `src/stores/search.js`
- Current search term is stored globally and also passed via query string `term`.
- Search results filter product name, type, min price, and max price.

Migration notes:

- Prefer URL query params as source of truth: `/searchResults?term=...&type=Women&min=10&max=200&page=1`.
- Keep form inputs local and sync to search params.
- Product search can be a TanStack Query keyed by query params.

### Auth and Account

- Current signup stores users and plain text passwords in `localStorage`.
- Current login reads users from `localStorage`, stores current email and username in `localStorage`, and optionally stores cookies with `js-cookie`.
- `isAuthenticated()` checks cookies, session storage, and local storage.
- Account details are saved in `localStorage` key `user`.
- Change password updates the local users array and a cookie.

Migration notes:

- Do not carry plain text localStorage password behavior into production code.
- For a prototype-only migration, isolate the current behavior behind an `auth.client.ts` adapter so it can be replaced.
- For a real app, use secure server-side auth with httpOnly cookies and route protection in middleware or server components.
- Account data should become `useAccountQuery()` plus `useUpdateAccountMutation()`.

### Shipping and Checkout

- Cart passes subtotal via route query to `/shipping`.
- Shipping form validates required fields client-side and passes address/order totals via route query to `/checkout`.
- Checkout has mock payment methods, a card dropdown, and clears cart after a SweetAlert success modal.
- Payment methods page saves card metadata to localStorage per email.

Migration notes:

- Avoid passing critical totals through query strings long term. Derive totals from cart/server order state.
- During first migration, preserve query behavior only as a compatibility step.
- Later introduce an order draft model:
  - `useCreateOrderDraftMutation()`
  - `useShippingQuoteQuery(address, method)`
  - `useConfirmPaymentMutation()`
- Use shadcn `Form`, `Input`, `Select`, `RadioGroup`, `Checkbox`, `Dialog`, and `Card` for these flows.

### Orders

- Current orders are static mock data in `Orders.vue`.

Migration notes:

- Move mock orders to a data file.
- Add `useOrdersQuery(userId)` and optional `useOrderQuery(orderId)`.

## Component Migration Map

| Vue component | React target |
| --- | --- |
| `HeaderComponent.vue` | `src/components/layout/site-header.tsx` |
| `Footer.vue` | `src/components/layout/site-footer.tsx` |
| `SidebarMenu.vue` | `src/components/account/account-sidebar.tsx` |
| `PageLoader.vue` | `src/components/shared/page-loader.tsx` or route `loading.tsx` |
| `LoginSignupPopup.vue` | shadcn `Dialog` wrapper |
| `DefaultBrand.vue`, `SecondaryBrand.vue` | `src/components/brand/brand-logo.tsx` |
| `PrimaryButton.vue`, `IconButton.vue` | shadcn `Button` variants |
| `InputField.vue` | shadcn `Input` + `Label` |
| `Banner.vue` | `src/components/home/banner.tsx` |
| `HeroSection.vue` | `src/components/home/hero-section.tsx` |
| `CategorySection.vue` | `src/components/home/category-section.tsx` |
| `TrendingVideos.vue` | `src/components/home/trending-videos.tsx` |
| `Testimonials.vue`, `TestimonialCard.vue` | `src/components/home/testimonials.tsx` |
| `serviceSection.vue`, `FeatureCard.vue` | `src/components/home/service-section.tsx` |
| `ListProducts.vue` | `src/features/products/product-list-section.tsx` |
| `RTBProductCard.vue` | `src/features/products/product-card.tsx` |
| `GeneralProducts.vue` | merge with product list section, with variant props |
| `ProductImage.vue` | `src/features/products/product-image-gallery.tsx` |
| `DetailsInfo.vue` | `src/features/products/product-details-info.tsx` |
| `ProductReviewers.vue` | `src/features/products/product-reviews.tsx` |
| `AddPayment.vue` | `src/features/payments/add-payment-dialog.tsx` |

Empty files to drop or ignore during migration:

- `src/User/UserDetail.vue`
- `src/components/Shopping/Shopping.vue`
- `src/views/UserPage/Home.vue`

## shadcn/ui Components to Add First

Start with:

```sh
npx shadcn@latest init
npx shadcn@latest add button input label card badge dialog alert-dialog sheet dropdown-menu navigation-menu tabs select radio-group checkbox table separator skeleton pagination form textarea
```

Likely component usage:

- `Button`: all primary, secondary, cart, checkout, and action buttons
- `Input`, `Label`, `Textarea`: auth, account, shipping, search, payment forms
- `Form`: validated form wrappers when adding `react-hook-form` and schema validation
- `Card`, `Badge`: product cards, order cards, promotions, stock labels
- `Dialog`, `AlertDialog`: login/signup prompt, logout confirmation, payment success, add payment method
- `Sheet`: mobile navigation/sidebar
- `DropdownMenu` or `NavigationMenu`: category menu
- `Tabs`: product details/reviews and add-payment Card/Bank tabs
- `Select`, `RadioGroup`, `Checkbox`: shipping/payment controls
- `Table`: delivery options and order details
- `Skeleton`: product lists and route loading states
- `Pagination`: search pagination

## Suggested Next.js Project Structure

```txt
app/
  layout.tsx
  page.tsx
  providers.tsx
  loading.tsx
  product/
    layout.tsx
    home/page.tsx
    men/page.tsx
    women/page.tsx
    children/page.tsx
    cart/page.tsx
    view/[id]/page.tsx
  searchResults/page.tsx
  shipping/page.tsx
  checkout/page.tsx
  login/page.tsx
  signup/page.tsx
  userpage/[id]/
    layout.tsx
    account/page.tsx
    favorites/page.tsx
    orders/page.tsx
    payment-methods/page.tsx
    change-password/page.tsx
src/
  components/
    ui/
    layout/
    brand/
    home/
    shared/
  features/
    auth/
    account/
    cart/
    checkout/
    favorites/
    orders/
    payments/
    products/
    search/
  lib/
    data/
    query-client.ts
    utils.ts
```

## TanStack Query Setup

Create a client provider in `app/providers.tsx` and wrap it in `app/layout.tsx`.

Recommended query boundaries:

- `products`: catalog and product detail data
- `favorites`: favorite ids/items
- `cart`: when API-backed, cart item list and cart mutations
- `account`: current account profile and updates
- `orders`: current user's orders
- `paymentMethods`: saved payment methods
- `shipping`: shipping quotes and selected method
- `checkout`: order draft and payment confirmation

Suggested query keys:

```ts
["products"]
["products", "detail", productId]
["products", "list", { type, group }]
["search", { term, type, minPrice, maxPrice, page }]
["cart"]
["favorites"]
["account", userId]
["orders", userId]
["paymentMethods", userId]
["shippingQuote", orderId, method]
```

## Data Model Cleanup Before Porting UI

Normalize product data before translating components:

```ts
type Product = {
  id: number
  name: string
  type: "Men" | "Women" | "Children"
  group: string
  images: string[]
  description: string
  quantity: number
  rating: number
  promotionPercentage: number
  price: number
}
```

Then create adapters for existing Vue data:

- `productId` -> `id`
- `productName` -> `name`
- `productType` -> `type`
- `productGroup` -> `group`
- `productImages` -> `images`

Normalize cart item data:

```ts
type CartItem = {
  productId: number
  name: string
  image: string
  price: number
  size: string
  quantity: number
  description?: string
}
```

Normalize favorites to ids:

```ts
type Favorite = {
  productId: number
}
```

## Assets Migration

Keep public assets in `public/images` so existing URL paths like `/images/mastercard.png` continue to work.

Fix these path patterns during migration:

- Replace `../../../public/images/...` with `/images/...`
- Replace `../../public/images/...` with `/images/...`
- Convert imported banner images to either `public/images/banner/...` URLs or imported static assets in React components
- Add remote image domains to `next.config` only if using Next `Image` for external URLs from Pexels, Wikimedia, or Freepik/CDN examples

Current static media:

- Product/category images: `public/images`
- OAuth/auth background images: `public/images/OAuth`
- Payment icons: `public/images/mastercard.png`, `public/images/visa.png`
- Logo: `public/images/defaultLogo.png` and `public/assets/assets/logo.png`
- Banner images: `src/components/Banner/banner1.png`, `banner2.png`, `banner3.png`
- Video file: `src/components/Videos/movie.mp4`
- Remote videos from Pexels in `TrendingVideos.vue`

## Domain Categories to Preserve

Source: `public/assets/assets/ProjectNote.txt`

- Men: Shirt, T-shirt, Pants, Hats, Krama, Short-pants, Shoes
- Women: Blouse, Sampot (Skirt), Dress, Scarf (Krama), Accessories, Shoes
- Children: Shirt, Pants, Dresses, Krama, Shoes, Accessories

Use this list as the source of truth for navigation category menus unless product data is later moved to a database.

## Migration Phases

### Phase 1: Scaffold and Foundations

- Create Next.js app with TypeScript and App Router.
- Initialize shadcn/ui.
- Add Tailwind and base theme tokens matching the current brand.
- Add TanStack Query provider.
- Copy static assets to stable public paths.
- Add data model adapters and mock product data.

### Phase 2: Product Browsing

- Port layout, header, footer, brand components.
- Port landing page and product home.
- Port category pages.
- Port product cards and list sections.
- Port search results with URL search params.
- Port product details with image gallery, tabs, reviews, stock status, size selection, favorites, and add-to-cart.

### Phase 3: Client State and Persistence

- Port cart with normalized item shape.
- Port favorites as product ids.
- Port auth popup behavior.
- Add local persistence adapters only where no backend exists.

### Phase 4: Checkout and Account

- Port shipping and checkout pages.
- Port user account layout and sidebar.
- Port account, favorites, orders, payment methods, and change password.
- Replace SweetAlert flows with shadcn `Dialog` or `AlertDialog`.

### Phase 5: Hardening

- Replace insecure localStorage auth with a real auth/session plan.
- Replace query-string checkout totals with server/order-derived totals.
- Add tests for product filters, cart totals, auth guards, and checkout calculations.
- Verify desktop and mobile layouts.
- Remove unused Vue files after parity is confirmed.

## Risks and Required Decisions

- Auth is insecure in the current prototype. Decide whether the migration is prototype-only or production-oriented before porting auth.
- There is no backend. Decide whether to introduce Next route handlers now or keep mock local data first.
- Cart and product item shapes are inconsistent. Normalize before porting cart/favorites.
- Two files define Pinia store id `"cart"`. Only migrate from `src/stores/cart.js` unless consolidation is done first.
- Some product image names referenced in mock data do not exist in `public/images`. Add missing assets or fallback images.
- Several pages have dead/commented data arrays. Do not migrate unused arrays unless they are needed for visible UI.
- Current CSS is component-scoped Vue CSS. Migration should use Tailwind/shadcn classes rather than copying scoped CSS wholesale.

## Acceptance Checklist for Migration

- All current routes render in Next.js.
- Header navigation, mobile menu, search, and account/cart actions work.
- Product lists filter by type and group.
- Product details render correct product, images, price, discount, stock, reviews, and add-to-cart behavior.
- Cart count, cart totals, quantity changes, remove, checkout navigation, and clear-on-payment work.
- Favorites persist and display.
- Login/signup/account pages keep prototype behavior or are replaced with real auth by decision.
- Shipping and checkout preserve the visible flow.
- No unresolved missing image paths in the browser console.
- `npm run build` passes in the Next.js app.
- Basic tests cover product filtering, cart totals, and auth adapter behavior.

## Official References

- Next.js App Router: https://nextjs.org/docs/app
- Next.js layouts and pages: https://nextjs.org/docs/app/getting-started/layouts-and-pages
- shadcn/ui Next.js install: https://v3.shadcn.com/docs/installation/next
- TanStack Query React install: https://tanstack.com/query/v5/docs/framework/react/installation
- TanStack Query with Next.js App Router/server rendering: https://tanstack.com/query/latest/docs/framework/react/guides/advanced-ssr
