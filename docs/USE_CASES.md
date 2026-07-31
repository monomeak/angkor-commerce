---
tags: [angkor-commerce, use-cases, roles, rbac, architecture]
date: 2026-07-31
---

# Use Cases by Role

Companion to `ANGKOR_COMMERCE_PROJECT_PROPOSAL.md` §2 (Roles) — this doc lists what each role can
actually _do_, from an anonymous storefront visitor up to the top of the staff ladder.

Two separate identity tracks, never mixed (see `CORE_API_DATA_MODEL.md` decision 7):

- **Customer-facing**: `Guest → Customer`. Self-service, ownership-based ("only my own order").
- **Staff-facing**: `Staff → Shop Admin → Super Admin`. One ladder — each role can do everything the
  one below it can, plus more.

## Customer-facing

### Guest (not logged in)

- Visit the home page
- Browse categories and products, search/filter by category or price
- Register for an account (`POST /storefront/auth/register`)
- **Cannot**: add to cart, check out, view any order/invoice, save an address — all require a
  `Customer` login. The `customer-portal` mock currently lets a guest add to cart with no login gate;
  that's a testing convenience, not the target design — it'll be adjusted to require login once the
  storefront auth is real.

### Customer (self-registered, logged in)

Everything a Guest can do, plus:

- Log in / log out, view own profile (`storefront/auth/login`, `/me`)
- Add items to a cart — client-only, never a server-side cart (decided, `CORE_API_DATA_MODEL.md`
  decision 1), but gated behind login so a cart is always tied to a real customer
- Save and manage shipping addresses
- Check out — places an `Order`, which auto-generates its `Invoice` in the same transaction
- Pay for an order (dev-only mock wallet first, then KHQR/ABA PayWay — `CORE_API_PAYMENTS.md`)
- View own order history and invoices
- **Cannot**: see any other customer's data, or reach anything under `/api/v1/**` (the staff API) —
  the two security chains make this structurally impossible, not just policy

## Staff-facing (back-office)

### Staff

- Log in to the back-office (`/api/v1/auth/login`, `/refresh`, `/logout`, `/me`)
- View customers — **read-only**: customers self-register, so staff never create or edit one
  (`CORE_API_DATA_MODEL.md` decision 10)
- Manage products — catalog, pricing, stock (per variant)
- Manage invoices — issue, void, mark paid; record payments against them
- View orders across all customers; cancel an order
- **Cannot**: create/edit/delete categories, manage staff accounts, or open Team/admin-only settings
  — enforced server-side today (`SecurityConfig` gates both to `SUPER_ADMIN`/`SHOP_ADMIN`)

### Shop Admin

Everything Staff can do, plus:

- Manage categories — create, edit, delete (soft-delete via `recordStatus`)
- Manage the team — view staff, invite/edit/deactivate `Staff` and other `Shop Admin` accounts
- **Cannot**: create or promote anyone to `Super Admin` — not an assignable role through the Team UI
  at all (`assignableRoles` only ever offers `Shop Admin`/`Staff`)

### Super Admin

Everything Shop Admin can do, plus:

- Outranks Shop Admin in the back-office UI's role hierarchy: can edit or demote a Shop Admin; a Shop
  Admin cannot touch a Super Admin account
- The seeded owner account (`V1__create_users_and_refresh_token.sql`) — not created through any UI

**Reality check**: the Shop Admin vs. Super Admin distinction above (rank, who can edit whom) exists
only in the back-office frontend today (`role.mapper.ts`, `team/lib/permissions.ts`). Spring Security's
`SecurityConfig` currently treats them identically everywhere (`hasAnyRole("SUPER_ADMIN", "SHOP_ADMIN")`)
— every other endpoint just requires "authenticated," so a plain `Staff` account has the same
server-side access as both admin roles outside of user-management and category writes. Spring Security
must stay the final authorization authority; frontend role checks are user-experience controls only —
so until the backend enforces the Super Admin/Shop Admin split, a `Staff` account that talks to the API
directly (not through the UI) has admin-level access to everything except user management and category
writes.

Every use case above that isn't already real today (see per-role notes and `CORE_API_DATA_MODEL.md`
for exact status) is designed but not yet built — this doc describes intended behavior, not a status
report.
