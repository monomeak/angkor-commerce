# Core API Endpoint Design

Drafted 2026-07-30. Companion to `CORE_API_DATA_MODEL.md`. This is a mock/draft REST contract for the
entities in that doc, following the conventions **already established in real, working code** —
`ApiConstants`, `ErrorResponse`/`GlobalExceptionHandler`, `UserListResponse`'s pagination shape — rather
than inventing a new style. Anything below marked *[existing]* is real today; everything else is
proposed.

## Conventions (extracted from real code, not invented here)

**Base path.** `ApiConstants.API_BASE = "/api/v1"`, with per-resource constants
(`AUTH_BASE`, `INVOICES_BASE`, `USERS_BASE`, `CUSTOMER_BASE`, `CATEGORIES_BASE`, ...) — every controller
should build its `@RequestMapping` off one of these rather than a literal string.

**Two namespaces, two security chains** (per `CORE_API_DATA_MODEL.md` decision 7):
- `/api/v1/{resource}` — staff, existing `SecurityFilterChain`, `hasAnyRole(...)` checks, Bearer JWT.
- `/api/v1/storefront/{resource}` — customers, a *new* `SecurityFilterChain` matched on
  `/api/v1/storefront/**`, resource-ownership checks (`order.customerId == token.customerId`) instead of
  role checks.

**Pagination** — DummyJSON-style `skip`/`limit`, not Spring's default `page`/`size` (matches
`UserListResponse` and the "DummyJSON-inspired" comments in the V2 migration):

```java
public record XListResponse(List<XResponse> items, long total, int skip, int limit) {}
```

Query params: `?skip=0&limit=30`. Internally still backed by Spring Data `Pageable`/`Page` (see
`UserServiceImpl.listUsers` for the reference implementation — converts `skip`/`limit` to a `PageRequest`
with a stable `Sort.by(Sort.Direction.ASC, "id")`).

**Exception: small, bounded, tree-shaped resources are returned whole, unpaginated.** `GET /categories`
deliberately does not paginate — categories are a small self-referencing tree (~20-25 rows total, not an
open-ended list like users/products/orders), and the client needs the *entire* flat list in one response
to reconstruct the parent/child tree. Paginating a tree risks splitting a parent from its children across
a page boundary, and the client would have to fetch every page anyway just to build one tree — which
defeats the purpose of paginating at all. Apply this same exception to any other small reference-data
resource (e.g. a future `customer_favorites` list is *not* this kind of resource — that one paginates
normally, since a customer's favorites can grow unbounded).

**Errors** — reuse the existing `ErrorResponse` record and `GlobalExceptionHandler` as-is, no new error
shape needed:

```json
{
  "status": 404,
  "error": "Not Found",
  "message": "Order not found",
  "path": "/api/v1/storefront/orders/42",
  "timestamp": "2026-07-30T10:00:00Z",
  "errors": null
}
```

**Success responses** — no generic envelope. Return the resource/DTO directly (`CustomerController`
returns `List<CustomerResponse>` and `ResponseEntity<CustomerResponse>` directly; `ApiResponse.java`
exists as an unused empty scaffold, confirming the team already moved away from a wrapper).

**DTOs** — `record XResponse(...)` with a static `XResponse.from(Entity entity)` factory; requests as
`record CreateXRequest(...)` / `UpdateXRequest(...)`; everything under `dto/request/` and
`dto/response/` inside its module. Service interface + `impl/XServiceImpl` split (see every existing
module). Entities use Lombok `@Getter @Setter` (see `Customer.java`), not hand-written accessors.

**Ownership resolution for storefront routes.** The authenticated principal on `/storefront/**` resolves
to a `customerId` (the `Customer` row's own id — email/passwordHash live directly on `Customer`, no
separate account table), the same way `@AuthenticationPrincipal AuthenticatedUser` resolves a staff user
today (see `AuthController`/`JwtAuthenticationFilter`). Every storefront query scopes by that
`customerId` — never trust a `customerId` passed in the request body/path.

---

## Staff API — `/api/v1/...`

| Resource | Method & path | Status | Notes |
|---|---|---|---|
| Auth | `POST /auth/login` | ✅ existing | Sets httpOnly `refreshToken` cookie, returns `AuthenticatedUserResponse`. |
| Auth | `POST /auth/refresh` | ✅ existing | Reads cookie, rotates tokens. |
| Auth | `POST /auth/logout` | ✅ existing | |
| Auth | `GET /auth/me` | ✅ existing | |
| Users | `GET /users?skip=&limit=&search=` | ✅ existing | `UserListResponse`. |
| Users | `POST /users`, `PUT /users/{id}`, ... | ✅ existing (partial) | |
| Customers | `GET /customers`, `GET /customers/{id}` | ✅ existing | Read-only on purpose (data model doc decision 10) — every `Customer` is self-registered via `POST /storefront/auth/register`, so there's no staff create/update endpoint to build. |
| Categories | `GET /categories`, `GET /categories/{id}` | ✅ implemented | Flat active list — client builds the tree, matching `customer-portal`'s mock `category-helpers.ts`. Public, no auth. |
| Categories | `POST /categories`, `PUT /categories/{id}`, `DELETE /categories/{id}` | ✅ implemented | `SUPER_ADMIN`/`SHOP_ADMIN` only. `DELETE` soft-deletes (`recordStatus = DELETED`). |
| Products | `GET /products?skip=&limit=&search=&categoryId=` | 🆕 planned | `ProductListResponse` in the same `{items, total, skip, limit}` shape. |
| Products | `GET /products/{id}` | 🆕 planned | |
| Products | `POST /products`, `PUT /products/{id}`, `DELETE /products/{id}` | 🆕 planned | Staff-only (create/edit catalog). |
| Orders | `GET /orders?skip=&limit=&status=&customerId=`, `GET /orders/{id}` | 🆕 planned | Staff view across all customers. |
| Orders | `POST /orders/{id}/cancel` | 🆕 planned | Per `CORE_API_DATA_MODEL.md` §4, `Order.status → CANCELLED`. |
| Invoices | `GET /invoices?skip=&limit=&status=`, `GET /invoices/{id}` | ✅ route exists, 🚧 backing empty | Frontend feature components already exist per proposal — this is the highest-leverage empty scaffold to fill in first on the back-office side. |
| Invoices | `POST /invoices` (manual, no order) | 🆕 planned | Keeps `orderId` nullable per `CORE_API_DATA_MODEL.md` §5. |
| Invoices | `POST /invoices/{id}/void`, `POST /invoices/{id}/mark-paid` | 🆕 planned | |
| Payments | `POST /invoices/{id}/payments` (record a manual payment) | 🆕 planned | Back-office bookkeeping entry — see `CORE_API_DATA_MODEL.md` §6, this is *not* the same as storefront checkout payment. |
| Payments | `GET /invoices/{id}/payments` | 🆕 planned | |

## Storefront API — `/api/v1/storefront/...`

| Resource | Method & path | Status | Notes |
|---|---|---|---|
| Auth | `POST /storefront/auth/register` | 🆕 planned | Creates a single `Customer` row directly (email + password now live on `Customer`, no separate account table). |
| Auth | `POST /storefront/auth/login` | 🆕 planned | Mirrors staff login's cookie pattern. |
| Auth | `GET /storefront/auth/me` | 🆕 planned | |
| Products | `GET /storefront/products?skip=&limit=&categorySlug=&search=&minPrice=&maxPrice=` | 🆕 planned | Public catalog read — fully public, no auth (matches how `customer-portal` already browses/searches without a login gate). Query params intentionally mirror what `customer-portal`'s mock `fetchProducts` filter shape already supports (`categorySlug`, `query`, `minPrice`/`maxPrice`) — the real endpoint should be a drop-in replacement for that function, not a redesign. |
| Products | `GET /storefront/products/{id}` | 🆕 planned | |
| Categories | `GET /storefront/categories` | 🆕 planned | Same flat-list shape as the staff endpoint; likely just reuse the staff `GET /categories` since categories aren't staff-sensitive data — no need for a separate storefront copy. |
| Addresses | `GET /storefront/addresses`, `POST`, `PUT /{id}`, `DELETE /{id}` | 🆕 planned | Scoped to the authenticated customer. Blocked on open question 2 in the data model doc (address shape reconciliation) before the request/response DTOs can be finalized. |
| Orders | `POST /storefront/orders` (checkout) | 🆕 planned | Body: shipping address (or `addressId`) + cart line items (`productId`, `size`, `quantity` — no price, server computes it). Creates `Order` + `OrderItem`s, auto-generates `Invoice`/`InvoiceItem`s in the same transaction per `CORE_API_DATA_MODEL.md` decision 4. |
| Orders | `GET /storefront/orders?skip=&limit=`, `GET /storefront/orders/{id}` | 🆕 planned | Scoped to `token.customerId`. |
| Invoices | `GET /storefront/invoices?skip=&limit=`, `GET /storefront/invoices/{id}` | 🆕 planned | Read-only, scoped to the customer. |
| Payments | `POST /storefront/orders/{orderId}/payments` | 🆕 planned | See `CORE_API_PAYMENTS.md` — full request/response contract, processor design, `DEV_WALLET`/`KHQR`. |

---

## Suggested build order

Matches the dependency order in `CORE_API_DATA_MODEL.md`:

1. ~~`Category` entity + `GET /categories`~~ — done 2026-07-30.
2. `CustomerAddress` entity — extend the table to match the frontend's `ShippingAddress` shape (data model doc, decision on open question 2).
3. `Product` entity + staff CRUD + `GET /storefront/products` — unblocks the back-office product screens *and* lets `customer-portal` swap its mock `fetchProducts` for a real call.
4. `Order`/`OrderItem` — new migration, entities, `POST /storefront/orders` checkout endpoint.
5. Wire `Invoice` auto-generation off `Order` checkout; fill in the rest of the invoice/payment (back-office) endpoints, since the frontend components for `/invoices` already exist and are just waiting on data.
6. Storefront payment processors per `CORE_API_PAYMENTS.md`.
