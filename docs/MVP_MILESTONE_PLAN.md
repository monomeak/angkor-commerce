# Angkor Commerce — MVP Milestone Plan

> Companion to [IMPLEMENTATION_INVENTORY.md](./IMPLEMENTATION_INVENTORY.md), which records
> what exists today. This document plans what to build next.
>
> **Planning constraints:** one milestone = one month, ~10 issues per milestone.
> **Written:** 2026-08-05, from the state at commit `690fa06`.

---

## MVP definition used here

A visitor can browse the catalogue without logging in, register as a customer, manage
their profile and shipping addresses, and build a cart that reflects real prices and
stock. They can then check out and pay with a prepaid demo balance, and receive an
order. Staff can log in to the back office and fully manage the catalogue — products,
variants, images, categories, inventory.

**MVP is M1–M5, five months.** Checkout, orders and the `DEV_WALLET` prepaid method are
confirmed in scope.

### Explicitly out of MVP scope

`invoice`, `dashboard`, `report`, and `audit` packages exist as empty scaffolds with
full DB tables behind them. They are **not** in any milestone below. Leave them empty
rather than half-filling them — an empty file is honest, a stub is a trap.

Also deferred to M6+:

- **KHQR / ABA PayWay.** The second half of `CORE_API_PAYMENTS.md`. `DEV_WALLET` alone
  gets checkout demoable; the real gateway brings webhooks, signing and sandbox
  credentials, which is a milestone of its own.
- **Back-office order management.** Endpoints and UI for staff to view and transition
  orders. Cut from M5 to make room for payment — see [What M5 gives up](#what-m5-gives-up).
- **The existing back-office `payment` package.** `Payment`, `PaymentMethod` and
  `PaymentStatus` in `com.angkor.commerce.payment` are *invoice bookkeeping*, a
  different concept from storefront payment. They belong with `invoice`, which is out
  of scope. See [Blockers before M5](#blockers-to-resolve-before-m5).

### Size markers

Issues are not equal. `S` ≈ a day, `M` ≈ 2–4 days, `L` ≈ a week or more. Each milestone
below is balanced to roughly fit a month, but the L-heavy ones (M2, M3) are the ones
likely to slip.

---

## M1 — API foundation & public catalogue

**One month · 10 issues · no frontend work**

The API currently has authorization holes that make it unsafe to point a browser at,
and the catalogue cannot be read without logging in — which blocks every storefront
task in M3. This milestone makes the API correct before anything is built on top of it.
Doing it first is deliberate: each of these bugs gets more expensive to fix once two
frontends depend on the current behaviour.

**Definition of done:** an unauthenticated request can browse the catalogue; no
authenticated customer can reach staff data or mutate catalogue data; image URLs are
usable by a browser; CI runs a non-empty test suite on every push.

| # | Issue | Size | Notes |
|---|---|---|---|
| 1 | Restrict product write endpoints to staff roles | M | Bug #11. `/products/**` currently falls to `anyRequest().authenticated()`, so any logged-in **customer** can create/update products and upload images. Split read vs write matchers in `SecurityConfig`, add `@PreAuthorize` to each write method. |
| 2 | Make catalogue reads public | S | Bug #13. `GET /products` and `GET /products/{id}` should be `permitAll`, matching what `CategoryController` already does. Blocks M3 entirely. |
| 3 | Restrict `/api/v1/customers` to staff | S | Bug #12. Any authenticated customer can currently list every customer's email, phone and tax number. |
| 4 | Fix inverted guard in `StorageCleanup.onRollback` | S | Bug #1. The condition returns whenever there *are* keys, so rollback cleanup never registers and every failed upload leaks a MinIO object. Add a test that asserts registration happens. |
| 5 | Resolve object keys to public URLs in responses | M | `ImageStorageService.resolveUrl()` is implemented and never called; every response returns a raw MinIO key. Both portals need real URLs. Decide key-vs-URL at the mapper boundary. |
| 6 | Replace `jakarta.validation.ValidationException` throws | S | Bug #3. Two sites throw the wrong exception type, so an invalid `?sortBy=` returns a 500 "unexpected error" instead of a 400. |
| 7 | Fix cross-principal 500 on `/me` endpoints | M | Bug #6. A customer token hitting `/api/v1/auth/me` injects a null principal → NPE. Needs a real decision on how the two identity chains are separated at the route level, not just a null check. |
| 8 | Make category archive a real soft delete | M | Bug #2. `archiveCategory` hard-deletes; `Category` has no `status` field, and the delete will fail on FK once products reference it. Add `status`, filter listings, migration. |
| 9 | Fix offset pagination in user & customer lists | S | Bug #5. `skip` is integer-divided into a page number, so any `skip` not a multiple of `limit` silently returns the wrong rows. `OffsetPageable` already solves this for products — reuse it. |
| 10 | Test harness + CI | L | First `@WebMvcTest` and `@DataJpaTest` slices, testcontainers wired into a real integration test, GitHub Actions running `mvn verify`. Pin `postgres:latest` to a version. This is the enabler for every later milestone. |

**Carried as chores, not issues:** the ~12 misspelled identifiers from the inventory
(`usernmae`, `PRODUCES_BASE`, `specificaion`, `delet`, `updateProfleImage`,
`aggragateByProductIds`, `hakari`, …). Fix them opportunistically inside whichever PR
already touches that file. Do **not** rename `V3__seed_categoties.sql` — it has been
applied and renaming breaks Flyway's checksum.

---

## M2 — Back-office catalogue management

**One month · 10 issues · frontend-heavy**

The back office is still wired to `https://dummyjson.com` and its three catalogue pages
are one-line placeholders. This milestone delivers the "back office catalogue
management" half of your MVP scope against the real API.

**Definition of done:** a staff user logs in against core-api and can create, edit,
archive, and search products; manage variants and images; manage the category tree;
and see stock levels — with no DummyJSON call remaining anywhere in the app.

| # | Issue | Size | Notes |
|---|---|---|---|
| 1 | Shared API client for core-api | M | Base URL from env, `credentials: 'include'` for the cookie auth, `ErrorResponse` → typed error mapping, 401 → refresh → retry. Everything else in M2/M3 depends on this. |
| 2 | Rewire auth to real `/api/v1/auth` | M | Replace `DummyLoginResponse`/`dummy-auth.ts` shapes, drop the `expiresInMins` param, move session from `access_token`/`user_role` cookies to the API's httpOnly cookies. Touches `proxy.ts` route protection. |
| 3 | Products list page | L | Table, server pagination, search, category/status/stock filters mapped to `ProductQueryParams`. Currently returns `<h1>Product page</h1>`. |
| 4 | Product create/edit form | L | All `CreateProductRequest`/`UpdateProductRequest` fields, category picker, currency/discount validation mirroring the server constraints. |
| 5 | Variant management UI | M | Add/edit/delete against the variant sub-resource, surface the SKU-uniqueness and last-variant-cannot-be-deleted rules as real UI states. |
| 6 | Product image upload UI | M | Multipart upload, reorder, delete, thumbnail preview, the 10-image cap. Depends on M1 #5 for displayable URLs. |
| 7 | Categories page | L | Tree view over the flat `GET /categories` response, create/edit/reorder/archive. Depends on M1 #8 for archive to mean anything. |
| 8 | Inventory page | M | Stock by variant across products, low-stock highlighting, inline stock edit via the variant PATCH. |
| 9 | Staff profile page on real API | S | Replace `dummy-user.ts` with `/auth/me`, `PATCH /auth/me`, and the avatar upload endpoint. |
| 10 | Customers list & detail on real API | M | Replace the DummyJSON `/users/search` calls with `/api/v1/customers`. Depends on M1 #3 for the endpoint to be staff-only. |

---

## M3 — Storefront catalogue & customer auth

**One month · 10 issues · frontend-heavy**

`customer-portal` has 19 routes and zero API integration — every page resolves against
mock arrays. This milestone connects the browse-and-identify half of the storefront.
It depends on M1 #2 (public reads) and reuses the client pattern from M2 #1.

**Definition of done:** an anonymous visitor browses real products and categories and
searches them; a visitor can register, log in, stay logged in across refreshes, and
manage their profile; `products.data.ts` and `account.data.ts` are deleted.

| # | Issue | Size | Notes |
|---|---|---|---|
| 1 | HTTP client + React Query setup | M | Same shape as M2 #1 but for the storefront's cookie names and error surfaces. Consider extracting to a shared workspace package if the duplication bites. |
| 2 | Product list from the API | M | Replace `fetchProducts` mock with `GET /products` + pagination. |
| 3 | Product detail from the API | M | `GET /products/{id}` including variants and images; wire size selection to real variant stock. |
| 4 | Category browsing from the API | M | Replace `categories.data.ts` and the client-side tree building in `category-helpers.ts` with `GET /categories`. |
| 5 | Search & filters | M | Map the existing filter UI to `ProductQueryParams` (`q`, `minPrice`, `maxPrice`, `size`, `inStock`, `categorySlug`). |
| 6 | Customer registration | M | Wire `signup-form.tsx` to `POST /storefront/auth/register`, surface the `@StrongPassword` and duplicate-email errors properly. |
| 7 | Customer login, logout & session | M | `/storefront/auth/login`, `logout`, and silent `refresh`; session state that survives a hard refresh. |
| 8 | Route protection for `/account/*` | S | Redirect unauthenticated users to login with a return path. The storefront has no middleware equivalent to the back office's `proxy.ts` yet. |
| 9 | Account profile page on real API | M | `GET`/`PATCH /storefront/auth/me` plus avatar upload. |
| 10 | Delete storefront mock data | S | Remove `products.data.ts`, `account.data.ts`, `categories.data.ts` and now-dead helpers. Do this as its own issue so it actually happens. |

---

## M4 — Cart & shipping addresses

**One month · 10 issues · full stack**

This closes your stated MVP scope. Note that **shipping addresses have no entity, no
table, and no endpoint today** — only denormalized `shipping_*` columns on `orders`,
which the schema comment explicitly describes as *not* an FK to a future
`customer_addresses` table. So this milestone starts with a real modelling decision.

**Definition of done:** a customer maintains a saved address book server-side; the cart
reflects live prices and stock rather than whatever was in `localStorage` when the item
was added; a guest cart survives login.

| # | Issue | Size | Notes |
|---|---|---|---|
| 1 | ADR: cart stays client-side | S | **Decided:** client-only cart with server repricing, matching the existing `V1` schema comment. Write it down in `docs/api-design-draft/` so the next person doesn't relitigate it. There is **no `carts` or `cart_items` table** in this plan. |
| 2 | `CustomerAddress` entity + `V5__add_customer_addresses.sql` | M | **Decided:** additive migration, `V1` untouched, checksums intact, no wipe. This is the only new table in M4 — addresses, not cart. |
| 3 | Address CRUD endpoints | M | `/storefront/addresses`, strictly ownership-scoped. This is the first endpoint family where a customer owns rows, so it sets the ownership-check pattern for M5. |
| 4 | Default-address rules | S | Exactly one default per customer, enforced in the service and by a partial unique index. |
| 5 | Address book UI | M | Replace the `localStorage` address handling in `account-address-form.tsx` with the real API. |
| 6 | Cart repricing endpoint | M | `POST /storefront/cart/validate` returning current price, stock and availability per variant. This is what makes a client-only cart trustworthy. |
| 7 | Cart wired to repricing | M | Stale-price and out-of-stock states surfaced in `cart-context.tsx` and the cart sheet. |
| 8 | Guest cart merge on login | M | The cart currently lives entirely in `localStorage` under `angkor-customer-cart`; define what happens when that user then logs in. |
| 9 | Stock display on product & cart | S | Surface real variant stock so a customer can't add 10 of something with 2 in stock. |
| 10 | Tests: address ownership + repricing | M | Ownership tests especially — this is the first place where a customer can read another customer's data if the scoping is wrong. |

---

## M5 — Checkout, orders & prepaid demo payment

**One month · 10 issues · full stack**

Closes MVP. `order`/`order_item` tables are already fully specified in `V1__baseline.sql`
with price-snapshot columns, the customer portal already has `checkout/`,
`checkout/confirmation/[orderNumber]/` and `account/orders/` routes built against mocks,
and `DEV_WALLET` is already designed in `CORE_API_PAYMENTS.md` — including the security
model, processor strategy and defense-in-depth rules. This milestone implements that
design's first half.

**Read [Blockers before M5](#blockers-to-resolve-before-m5) first.** Three naming and
modelling collisions must be resolved before issue #1 can start.

**Definition of done:** a customer checks out with a saved address, pays from a prepaid
demo balance, and receives an order number; stock cannot be oversold; `DEV_WALLET` is
impossible to select in a production profile.

| # | Issue | Size | Notes |
|---|---|---|---|
| 1 | Resolve the payment naming collision | S | Blocker #1 below. Decide package/class names for storefront payment so they don't clash with the existing invoice `Payment`/`PaymentMethod`/`PaymentStatus`. Nothing else in M5 can start first. |
| 2 | Order repositories, service interface & impl | L | Fill the empty files in the `order` package. Entities and `OrderStatus` already exist. |
| 3 | `POST /storefront/orders` | L | Transactional: validate stock, decrement variants, snapshot title/sku/price per the schema's intent, generate the order number. |
| 4 | Customer order history endpoints | M | `GET /storefront/orders` and `/{id}`, ownership-scoped using the M4 #3 pattern. |
| 5 | Order payment status + `V6` migration | M | Blocker #3 below. `OrderStatus` has no `PAID`, and the `V1` check constraint rejects it. Decide whether payment state lives on `Order` or only on the payment row, then migrate. |
| 6 | `DevWallet` entity, service & `V6` tables | M | Per-customer fake balance plus the storefront payment table. No wallet or storefront-payment table exists in `V1`. Seed the demo account's balance. |
| 7 | `PaymentProcessor` + `DevWalletPaymentProcessor` | M | The registry/strategy shape is already specified in `CORE_API_PAYMENTS.md`. Build the interface and registry now even with one processor, so KHQR drops in later without rework. |
| 8 | `POST /storefront/orders/{id}/payments` + production lockout | M | Amount computed server-side, never from the request body. Feature flag **and** Spring profile guard, per the doc's defense-in-depth section. |
| 9 | Checkout + confirmation + order history UI | L | Address selection, payment method picker (wallet balance shown), place order, error recovery, then the confirmation page and `account/orders` on real data. Replaces `orders-storage.ts`. |
| 10 | Concurrency + integration tests | L | Two customers buying the last item; double-payment on one order; wallet debit atomicity. The highest-value tests in the project — money and stock correctness. Easy to skip and expensive to retrofit. |

### What M5 gives up

Adding payment to a milestone that was already L-heavy means something moves out.
**Back-office order management** — staff endpoints for listing orders and driving
`PENDING → INVOICED → CANCELLED`, plus the back-office orders pages — is deferred to M6.

The tradeoff: at end of MVP, orders exist and customers can see their own, but **staff
cannot see orders in the back office at all**. For a demo where the customer journey is
the thing being shown, that is a reasonable cut. If staff-side order visibility is part
of what you want to demo, M5 is an 13-issue milestone or a six-week one — say so now
rather than discovering it in week three.

---

## Resolved decisions

All three open questions from the first draft are now settled.

**1. MVP includes checkout — with a prepaid demo payment.** ✅ Five-month plan. The
prepaid option maps exactly to `DEV_WALLET` in `CORE_API_PAYMENTS.md`, which is already
designed down to the processor interface. KHQR/ABA PayWay stays out until M6+.

**2. Client cart.** ✅ Matches the existing `V1` schema comment ("cart stays
client-only"). Consequence worth restating: **there is no cart API and no cart table**.
M4's cart work is a repricing endpoint plus a guest-cart merge, nothing more.

**3. Additive `V5`, no squash.** ✅ Correct call, and correctly reasoned — `V1` stays
untouched, checksums still match, Flyway just applies the new file, no wipe.

> ⚠️ **One correction.** Your example was `V5__add_cart_tables.sql` creating `carts` and
> `cart_items` — but that contradicts decision 2. With a client-side cart there is
> nothing cart-shaped to persist. The M4 migration is
> **`V5__add_customer_addresses.sql`**. M5 then adds `V6` for the wallet and storefront
> payment tables. The *mechanism* you described is exactly right; only the table names
> were wrong.

---

## Blockers to resolve before M5

`CORE_API_PAYMENTS.md` was drafted 2026-07-30 against an earlier state of the code.
Three things in it now collide with what has since been implemented. All three are
cheap to decide and expensive to discover mid-milestone.

**1. Class-name collision in `com.angkor.commerce.payment`.** The doc's "Recommended
package structure" places `Payment.java`, `PaymentMethod.java` and `PaymentStatus.java`
at paths where **all three already exist and are implemented** — for back-office invoice
bookkeeping, with entirely different values:

| Class | Exists today (invoice bookkeeping) | Doc proposes (storefront) |
|---|---|---|
| `PaymentMethod` | `CASH, BANK_TRANSFER, QR_CODE, CARD, OTHER` | `DEV_WALLET, KHQR` |
| `PaymentStatus` | `COMPLETED, VOIDED, REFUNDED` | `PENDING, PAID, FAILED, CANCELLED, EXPIRED, REFUNDED` |
| `Payment` | `@ManyToOne(optional = false) Invoice` | attaches to an `Order` |

They cannot both live at those paths. The doc's own prose already says the two concepts
are "deliberately distinct" and "don't share a table" — the package layout just wasn't
updated to match. Pick distinct names (`OrderPayment` / `storefront.payment` package /
similar) as M5 issue #1.

**2. No wallet or storefront-payment table exists.** `V1` has a `payments` table, but it
is `NOT NULL` FK'd to `invoices` and constrained to the invoice-side enum values — it
cannot hold a storefront order payment. `DevWallet` has no table at all. Both are new in
`V6`.

**3. `Order` has no `PAID` state.** The doc's flow diagram ends "Order → PAID", but
`OrderStatus` is `PENDING, INVOICED, CANCELLED` and `V1` enforces
`CHECK (status IN ('PENDING','INVOICED','CANCELLED'))`. Either add `PAID` and alter the
constraint, or keep payment state solely on the payment row and leave `OrderStatus`
alone. Decide before writing issue #3.

**Also worth knowing:** the doc notes that `customer-portal`'s saved-card feature — ten
files including Luhn validation, add/edit card forms and a card selector — **has no
counterpart in the KHQR design**, since KHQR is a per-transaction bank-app flow, not a
stored token. That UI is dead against this payment model. Deleting it is not an MVP
issue, but don't wire it to anything.

## Sequencing rationale

M1 is not optional and not reorderable. Items #1, #2 and #3 are authorization defects,
and #2 in particular blocks all of M3 — a storefront cannot browse a catalogue that
requires a login. Building either portal against the current API means building against
behaviour that has to change.

M2 and M3 are independent of each other and could swap or overlap if you want a visible
win sooner. M2 is the better second milestone if you want the project to *look* finished
(the back office is closer to done); M3 is better if you want the public-facing demo
first.

M4 depends on M3 for the account UI it extends. M5 depends on M4 for addresses, and on
its own issue #1 (the naming collision) before anything else in it can start.

## Risk notes

- **M2 and M3 are both L-heavy** (three and zero L-issues respectively, but many M's on
  unfamiliar UI work). These are the two most likely to run past a month.
- **Testing debt compounds.** M1 #10 is the only test-infrastructure issue in the plan;
  every milestone after it assumes tests are written alongside features. If M1 #10 slips,
  everything after it ships untested.
- **Two frontends, one API client.** M2 #1 and M3 #1 are near-duplicates. Watch for the
  point where extracting a shared workspace package is cheaper than maintaining both.
- **M5 is the tightest milestone in the plan.** Two L-issues plus a payment subsystem,
  after giving up two issues' worth of back-office scope to fit. It is also the one with
  three unresolved design collisions in front of it. If any milestone needs six weeks,
  this is it.
- **`DEV_WALLET` must never be reachable in production.** The design's defense-in-depth
  rule — feature flag **and** Spring profile, plus registering the processor bean only
  outside prod — is the one thing in M5 that is a real security control rather than a
  correctness concern. The frontend `NEXT_PUBLIC_DEV_WALLET_ENABLED` flag decides only
  what to *show*; it is never the guard.
