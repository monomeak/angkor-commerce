# Angkor Commerce

A full-stack commerce platform: customers register and shop through a public storefront; staff run
the shop — products, customers, invoices, reports, analytics — through a back-office portal. Both
front ends share one Spring Boot API and one PostgreSQL database, so there's a single source of truth
for every order, invoice, and customer record.

- **Last reviewed:** July 31, 2026
- **Status:** backend and both front ends are under active, parallel build. Nothing is in production.
  This doc is intentionally short — see [§7](#7-where-the-detail-lives) for where the real detail lives.

## 1. Core flows

**Customer** (`apps/customer-portal`): register/log in → browse products by category, search, filter
→ add to cart → checkout → order (cart is client-only; an `Order` is created at checkout, which
auto-generates its `Invoice` in the same transaction) → view past orders/invoices, manage addresses.

**Shop side** (`apps/back-office-portal`): staff manage the whole operation —

- Products — catalog, stock, pricing
- Customers — view accounts and their order/invoice history
- Invoices — issue, record payments, void
- Reports & analytics — sales, revenue, stock levels
- Team — manage staff accounts (admin roles only)

## 2. Roles

One ladder, not separate systems — each role can do everything the one below it can, plus more:

| Role | Scope |
| --- | --- |
| `STAFF` | Day-to-day: view/manage invoices, customers, products |
| `SHOP_ADMIN` | Everything `STAFF` can, plus manage staff accounts and shop settings |
| `SUPER_ADMIN` | Everything `SHOP_ADMIN` can — top of the ladder, not a separate system |

Customers are a fully separate identity (`Customer`, self-registered, ownership-based access — "can
this customer touch only their own order") — never a `Role` value, and never mixed with staff auth.

## 3. Apps & architecture

- `apps/customer-portal` — public storefront (Next.js)
- `apps/back-office-portal` — staff dashboard (Next.js)
- `apps/core-api` — one Spring Boot + PostgreSQL backend behind both

No data duplication between the front ends — they're two clients of the same API/database, split by
security chain: `/api/v1/**` for staff (role checks), `/api/v1/storefront/**` for customers (ownership
checks). See `CORE_API_DATA_MODEL.md` decision 7 for why this isn't multi-tenancy.

## 4. Tech stack

| | |
| --- | --- |
| Frontend | Next.js 16, React 19, TypeScript, Tailwind CSS + shadcn/ui, TanStack Query, Zod |
| Backend | Java 21, Spring Boot, Spring Security (JWT), Spring Data JPA |
| Database | PostgreSQL, Flyway migrations |
| Infra | Docker Compose (Postgres + `core-api`) |

## 5. Current status

- **Backend** (`apps/core-api`): auth, users, and customers (self-registration, merged with login
  credentials) are real. Categories are real. Products, orders, invoices, and payments are designed
  but not yet built (empty scaffolds). Full breakdown: `CORE_API_DATA_MODEL.md`.
- **`back-office-portal`**: UI largely built against mock DummyJSON data (dashboard, invoices layer,
  settings); not yet wired to the real backend beyond auth-shaped screens. Placeholder routes:
  `/invoices`, `/customers`, `/reports`, `/analytics`, `/team`.
- **`customer-portal`**: UI largely built against local mock/localStorage data — home, browse/search,
  cart, checkout, account (orders, favorites, payment methods); not yet wired to the real backend.

The near-term work on both front ends is replacing their mock data layer with real `core-api` calls,
feature by feature, as each backend module gets built.

## 6. MVP scope

- Customer: register, browse, order, checkout, view own orders/invoices.
- Staff: manage products, customers, invoices; basic reports; role-based access.
- Payments: dev-only mock wallet first, then KHQR/ABA PayWay — see `CORE_API_PAYMENTS.md`.
- PostgreSQL persistence, Docker Compose, OpenAPI docs, and critical automated tests.

**Deferred beyond MVP:** multi-company tenancy, multi-currency, subscriptions/recurring invoices,
real-time notifications, advanced BI reporting.

## 7. Where the detail lives

- **Use cases per role** — `USE_CASES.md` (what a Guest, Customer, Staff, Shop Admin, and Super Admin
  can each actually do — and which of that is real today vs. designed but not built).
- **Data model & design decisions** — `CORE_API_DATA_MODEL.md` (entities, schema, the "why" behind
  every non-obvious call: customer/account merge, leaf-only product categories, variants-always stock).
- **REST contract** — `CORE_API_ENDPOINTS.md` (endpoints, conventions, status per route).
- **Payments design** — `CORE_API_PAYMENTS.md` (`DEV_WALLET`/`KHQR`/`ABA PayWay` processor design).
- **Frontend conventions & current state per app** — each app's own `AGENTS.md`/`CLAUDE.md`.
