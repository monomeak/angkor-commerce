# Angkor Commerce

## Project Proposal and Current Delivery Plan

- **Last reviewed:** July 29, 2026
- **Current phase:** Stage 2 underway — the Spring Boot backend foundation (auth, users, customers) is implemented alongside the Stage 1 frontend prototype. A third, customer-facing storefront/portal application has been designed (Section 17) but not yet scaffolded.
- **Repository model:** pnpm/Turborepo monorepo with one Next.js application (`apps/back-office-portal`, staff back-office) and one Spring Boot/Maven application (`apps/core-api`); a customer-facing storefront app is planned as a third workspace member

## 1. Project Summary

Angkor Commerce is a learning-focused, production-shaped application for managing invoices, customers, payments, teams, analytics, and business reports.

Delivery is split into two stages:

1. Build and validate the frontend with Next.js and DummyJSON.
2. Add a Spring Boot and PostgreSQL backend, then replace temporary integrations feature by feature.

This document reflects the repository as it exists today. It distinguishes completed foundations, partial work, placeholders, and future architecture so the proposal can also serve as a delivery roadmap.

A third, self-service customer portal (storefront) sharing the same `apps/core-api` backend is planned as an extension beyond the original two-stage plan; see Section 17.

## 2. Goals

- Build a responsive invoice-management dashboard with a clear feature-based architecture.
- Keep UI components independent from DummyJSON-specific response shapes.
- Use TanStack React Query for server state and Zod for boundary validation.
- Introduce secure authentication and role-based access control with the real backend.
- Use OpenAPI as the contract between the TypeScript frontend and Java backend.
- Add automated testing, containerized local development, and continuous integration.
- Provide enough documentation for another developer to run, test, and extend the system.

## 3. Current Repository Snapshot

### Implemented foundation

- pnpm workspace containing `apps/back-office-portal`.
- Turborepo tasks for development, build, lint, and start.
- Next.js 16 App Router application using React 19 and TypeScript.
- Tailwind CSS 4, shadcn/ui components, responsive sidebar, header, landing page, and theme-ready design tokens.
- TanStack React Query provider with shared query defaults.
- Zod schemas at API and form boundaries.
- DummyJSON authentication, registration simulation, current-user lookup, and client-side session persistence.
- Route protection and basic role gates through the Next.js `proxy.ts` convention.
- Dashboard overview UI with cards, charts, recent invoices, query hooks, and local fallback data.
- Invoice domain types, schemas, mapper, API function, query hooks, filters, pagination, table, status badges, and details dialog.
- Profile types, schema, mapper/hooks, and settings UI.
- Appearance and privacy/security settings screens.
- Spring Boot API (`apps/core-api`, Java 21, Maven Wrapper) with a package-per-module layout: `auth`, `user`, `customer`, `product`, `invoice`, `payment`, `dashboard`, `report`, `audit`, `security`, `common`, `config`.
- JWT-based authentication end to end: `POST /api/v1/auth/login`, `/refresh`, `/logout`, `GET /api/v1/auth/me`, backed by Spring Security (`SecurityConfig`, `JwtAuthenticationFilter`) and a staff `User`/`Role` model (`SUPER_ADMIN`, `SHOP_ADMIN`, `STAFF`).
- Flyway migrations for `customers`, `users`, and `refresh_tokens` tables; PostgreSQL runs via the now-functional root `docker-compose.yml`.
- `Customer` entity with a read-only `CustomerController` (`list`, `get` by id).
- Springdoc/OpenAPI wired up with a Bearer security scheme for Swagger UI.

### Partial or scaffolded

- The `/invoices` route is still a placeholder even though invoice feature components exist.
- `/customers`, `/reports`, `/analytics`, and `/team` are placeholder routes.
- Registration and forgot-password flows are simulations because DummyJSON does not persist them.
- Dashboard data uses a mock fallback because DummyJSON has no dashboard aggregate endpoint.
- Profile data is local dummy data.
- Authorization currently covers `/team` and `/settings/privacy-security`; it is not a complete permission model.
- The invoice mapper generates presentation fields that DummyJSON carts do not contain.
- `Product`, `Invoice`/`InvoiceItem`, and `Payment` exist only as empty scaffold classes from the initial package-structure commit — no fields, persistence, or endpoints yet.
- `Customer` has no create/update endpoint (only `list`/`get`) and no unique constraint on `email`.
- Root `.env.example` and `docker-compose.yml` are populated and functional (Postgres + `apps/core-api`, with health checks), but `apps/back-office-portal` has no Dockerfile yet and is not part of the Compose file.
- Root `README.md` currently mirrors this proposal document rather than containing setup/run instructions.

### Not started in the current repository

- `Order`/`OrderItem` entities and self-service customer accounts — required by the storefront design in Section 17.
- OpenAPI-generated frontend client (TypeScript types/hooks generated from the springdoc contract).
- Unit, integration, and Playwright test suites.
- CI pipeline (no `.github/workflows` yet).

## 4. Current Technology Stack

| Area | Current choice |
| --- | --- |
| Monorepo | pnpm 10 workspace and Turborepo 2 |
| Frontend | Next.js 16 App Router, React 19, TypeScript 5 |
| Styling | Tailwind CSS 4, shadcn/ui, Base UI |
| Server state | TanStack React Query 5 |
| Validation | Zod 4 |
| Charts | Recharts 3 |
| Notifications | Sonner |
| Icons | Lucide React |
| Temporary API | DummyJSON through native `fetch` (frontend still Stage 1) |
| Backend | Java 21, Spring Boot, Maven Wrapper — implemented for `apps/core-api` |
| Persistence | PostgreSQL, Spring Data JPA, Flyway-managed migrations (not Hibernate auto-schema) |
| Backend security | Spring Security, JWT via `jjwt` |
| Infrastructure | Docker (`apps/core-api/Dockerfile`) and Docker Compose (Postgres + API); `apps/back-office-portal` not yet containerized |

React Hook Form is part of the intended form strategy but is not currently installed. Current forms use local React state plus Zod validation.

## 5. Current Repository Structure

```text
angkor-commerce/
├── apps/
│   ├── back-office-portal/          # Staff back-office (Next.js, Stage 1 + partial Stage 2)
│   │   ├── app/
│   │   │   ├── [locale]/           # next-intl locale segment (en default, km)
│   │   │   │   ├── (auth)/
│   │   │   │   ├── (dashboard)/
│   │   │   │   └── unauthorized/
│   │   │   ├── api/                # Next.js route handlers (e.g. insights/analyze)
│   │   │   ├── layout.tsx
│   │   │   └── providers.tsx
│   │   ├── components/
│   │   │   ├── home/               # Public landing-page sections
│   │   │   ├── layout/             # Dashboard shell and navigation
│   │   │   └── ui/                 # Reusable shadcn/ui components
│   │   ├── config/                  # Environment parsing
│   │   ├── hooks/                   # Application-level hooks
│   │   ├── lib/                     # Shared app utilities
│   │   ├── messages/                 # next-intl translation catalogs (en, km)
│   │   ├── public/
│   │   ├── src/
│   │   │   ├── features/
│   │   │   │   ├── auth/
│   │   │   │   ├── dashboard-overview/
│   │   │   │   ├── invoices/
│   │   │   │   └── profile/
│   │   │   └── shared/              # Cross-feature types, hooks, and helpers
│   │   ├── proxy.ts                 # Authentication and role redirects
│   │   └── package.json
│   └── core-api/                     # Spring Boot back-office API — see Section 10 for detail
├── docker/                          # Reserved; currently empty
├── docs/
│   └── ANGKOR_COMMERCE_PROJECT_PROPOSAL.md
├── .env.example                     # Populated (mirrors Section 13)
├── docker-compose.yml               # Functional: Postgres + apps/core-api, with health checks
├── package.json
├── pnpm-lock.yaml
├── pnpm-workspace.yaml
├── README.md                        # Currently mirrors this proposal; not yet run/setup instructions
└── turbo.json
```

The App Router lives at `apps/back-office-portal/app`, while feature code lives at `apps/back-office-portal/src/features`. Future work should preserve this convention instead of moving `app` beneath `src` without a deliberate migration.

## 6. Current Frontend Architecture

Each implemented feature generally follows this shape:

```text
Route page
  → feature view/component
  → React Query hook
  → feature API function
  → Zod response validation and mapper
  → DummyJSON (Stage 1) or Spring Boot (Stage 2)
```

Feature folders may contain:

```text
feature/
├── api/
├── components/
├── hooks/
├── lib/
├── mappers/
├── schemas/
├── types/
└── views/
```

Rules to retain:

- Route pages should compose feature views and remain small.
- UI components should not call DummyJSON directly.
- DummyJSON response types should stay separate from domain types.
- External responses should be validated before mapping into domain objects.
- Query keys should be owned by their feature.
- URL search parameters should become the source of truth for shareable list filters and pagination.

## 7. Current Routes

Next.js route groups do not add URL segments. The implemented URL design is therefore flat rather than nested under `/dashboard`. Routes now also live under an `app/[locale]/` segment (`next-intl`, locales `en`/`km`, `localePrefix: "as-needed"`), so the paths below are unchanged for the default locale (`en`) and additionally reachable under `/km/...`.

| Route | Status |
| --- | --- |
| `/` | Implemented public landing page |
| `/login` | Implemented with DummyJSON |
| `/register` | Implemented; simulated persistence |
| `/forget-password` | Implemented UI; simulated request |
| `/overview` | Implemented dashboard overview with fallback data |
| `/invoices` | Placeholder route; feature layer is substantially built |
| `/customers` | Placeholder |
| `/reports` | Placeholder |
| `/analytics` | Placeholder |
| `/team` | Placeholder and role-gated |
| `/settings/profile` | Implemented with dummy profile data |
| `/settings/appearance` | Implemented UI |
| `/settings/privacy-security` | Implemented UI and role-gated |
| `/unauthorized` | Implemented |

The route names in code are the current source of truth. Future resource-detail routes should follow the same flat model, for example `/invoices/[id]` and `/customers/[id]`, unless the team intentionally adopts a `/dashboard/*` prefix.

## 8. Authentication and Authorization

### Stage 1 behavior

- `POST /auth/login` authenticates against DummyJSON.
- `GET /auth/me` supplies the current user and temporary role mapping.
- `POST /users/add` simulates registration.
- Forgot password is a local delayed response.
- The session is stored in `localStorage`; readable cookies mirror the access token and role so `proxy.ts` can redirect requests.
- Unauthenticated users are redirected to `/login` with a `redirect` query parameter.
- Authenticated users visiting auth pages are redirected to `/overview`.

This is acceptable only for the learning prototype. Tokens in `localStorage` or JavaScript-readable cookies are exposed to cross-site scripting and must not be the production design.

### Stage 2 target

The Spring Boot API should expose:

```http
POST /api/v1/auth/login
POST /api/v1/auth/refresh
POST /api/v1/auth/logout
GET  /api/v1/auth/me
```

Use short-lived access tokens and rotated refresh tokens in `HttpOnly`, `Secure`, `SameSite` cookies, or introduce a Next.js backend-for-frontend session layer. Spring Security must remain the final authorization authority; frontend role checks are user-experience controls only.

## 9. Functional Scope

### MVP

- Authentication and protected dashboard routes.
- Customer list, detail, create, update, and archive flows.
- Product list, detail, create, update, stock state, and archive flows.
- Invoice list, detail, create, update, items, discounts, totals, and statuses.
- Payment recording and remaining-balance calculation.
- Dashboard aggregates and recent invoices.
- Search, filter, sort, and pagination.
- Basic team and role administration.
- CSV export and print-friendly invoices.
- PostgreSQL persistence, OpenAPI documentation, Docker Compose, and critical automated tests.
- Customer self-registration, login, and self-service order placement/invoice viewing via a storefront app (Section 17).

### Deferred beyond MVP

- Multi-company tenancy.
- Multiple currencies and exchange rates.
- Recurring invoices and subscription billing.
- Advanced accounting and tax jurisdiction rules.
- Real-time notifications.
- External payment gateways.
- Advanced audit and business-intelligence reporting.

## 10. Stage 2 Backend Architecture

Add the Java application as `apps/core-api`, but do not add it to `pnpm-workspace.yaml`. Maven owns the backend build; root scripts or CI coordinate both build systems.

```text
apps/core-api/
├── src/main/java/com/angkor/commerce/
│   ├── auth/
│   ├── user/
│   ├── customer/
│   ├── product/
│   ├── order/
│   ├── invoice/
│   ├── payment/
│   ├── dashboard/
│   ├── report/
│   ├── audit/
│   ├── security/
│   ├── common/
│   └── config/
├── src/main/resources/db/migration/
├── src/test/
├── pom.xml
├── mvnw
├── mvnw.cmd
└── Dockerfile
```

As of July 29, 2026: `auth`, `user`, `security`, and `customer` (read-only) are implemented; `product`, `order`, `invoice`, and `payment` are empty scaffold packages (classes exist with no fields/logic/endpoints) — `order` was scaffolded to support the storefront extension in Section 17.

Use thin controllers, service-owned business rules, repository-owned persistence, DTOs at HTTP boundaries, and transactions around invoice/payment workflows.

### Initial tables

- `users`, `roles`, `user_roles`
- `customers`
- `products`
- `orders`, `order_items`
- `invoices`, `invoice_items`
- `payments`
- `refresh_tokens`
- `audit_logs`

Prefer archive/status columns for business records over destructive deletion. Store money as fixed-precision decimals and define rounding rules centrally. Invoice numbers need a database-enforced unique constraint and a concurrency-safe generation strategy.

## 11. API Contract Strategy

Springdoc OpenAPI should be the contract source of truth:

```text
Spring DTOs → OpenAPI document → generated TypeScript client/types → frontend hooks
```

Choose one generator after a short proof of concept (Orval, Hey API, or `openapi-typescript`). Commit either the generated client or a reproducible generation command, and add a CI check that detects contract drift.

Standardize early:

- Error response shape and machine-readable error codes.
- Pagination, sorting, and filtering parameters.
- Date/time format and timezone rules.
- Decimal/money serialization.
- Idempotency behavior for payment and invoice-finalization commands.
- Optimistic concurrency for edits.

## 12. Testing Strategy

### Frontend

- Vitest and React Testing Library for mappers, schemas, hooks, components, and form behavior.
- Mock Service Worker for API success, validation, empty, and failure states.
- Playwright for authentication, invoice creation, payment, filters, permissions, and report downloads.

### Backend

- JUnit 5 and Mockito for service rules.
- Spring Boot tests and MockMvc for API and security behavior.
- Testcontainers with PostgreSQL for repositories and transactional workflows.

### Contract and quality gates

- OpenAPI compatibility or generated-client drift check.
- TypeScript type-check, lint, build, unit tests, and selected Playwright smoke tests in CI.
- Backend compile, unit tests, integration tests, and migration validation in CI.

## 13. Environment and Infrastructure

Populate the root `.env.example` without real secrets. A practical initial contract is:

```env
NEXT_PUBLIC_APP_NAME=Angkor Commerce
NEXT_PUBLIC_API_BASE_URL=https://dummyjson.com

SERVER_PORT=8080
POSTGRES_DB=acme_invoice
POSTGRES_USER=acme
POSTGRES_PASSWORD=change_me
SPRING_DATASOURCE_URL=jdbc:postgresql://postgres:5432/acme_invoice
SPRING_DATASOURCE_USERNAME=acme
SPRING_DATASOURCE_PASSWORD=change_me
CORS_ALLOWED_ORIGINS=http://localhost:3000
```

Do not expose backend secrets through `NEXT_PUBLIC_*`. Document which values are required for the browser, Next.js server, Spring Boot process, and Docker Compose.

The root `docker-compose.yml` should eventually coordinate PostgreSQL, the API, and the web application, with health checks and dependency conditions. Keep Dockerfiles next to their applications.

## 14. Revised Delivery Roadmap

### Milestone 1 — Stabilize the existing frontend foundation

- Connect `/invoices` to the existing `InvoicesListView` and verify its loading, error, empty, filter, details, and pagination states.
- Fix naming and consistency issues such as `forget-password` versus the conventional `forgot-password` before links become widespread.
- Add a shared API error model and response-validation policy.
- Populate `.env.example` and `README.md`.
- Add `typecheck` and test tasks to the workspace pipeline.

### Milestone 2 — Complete Stage 1 core resources

- Implement customers and products with DummyJSON adapters.
- Add invoice create/edit flows and URL-based list state.
- Decide whether reports and analytics are separate modules or one reporting area.
- Complete team/role UI using clearly documented mock permissions.
- Add accessible loading, empty, error, and confirmation states.

### Milestone 3 — Establish automated tests

- Test schemas, mappers, calculations, and role mapping first.
- Add component/integration tests for auth and invoices.
- Add Playwright smoke tests for login, route protection, invoice browsing, and logout.
- Run lint, type-check, tests, and build in CI.

### Milestone 4 — Backend foundation (in progress)

- Done: `apps/core-api` scaffolded with Java 21, Maven Wrapper, Spring Boot, Spring Security, Spring Data JPA, Flyway migrations, Springdoc, and PostgreSQL; JWT auth (`login`/`refresh`/`logout`/`me`); staff `User`/`Role` model; `Customer` entity with read-only endpoints; `Dockerfile` and a working root Compose environment (Postgres + API).
- Remaining: common error/pagination response contracts, health/readiness checks beyond default actuator, Testcontainers-backed repository tests, and the `Product`/`Invoice`/`Payment` implementations (currently empty scaffolds).

### Milestone 6 — Customer portal / storefront (Section 17)

- Add `Order`/`OrderItem` entities, the `order` module, and the `orders`/`order_items` migrations.
- Extend `Customer` with `passwordHash`/`emailVerified` and a unique constraint on `email`.
- Add a second `SecurityFilterChain` for `/api/v1/storefront/**`, plus customer `register`/`login` endpoints.
- Implement checkout: placing an order auto-generates its `Invoice`/`InvoiceItem`s in one transaction.
- Scaffold the storefront frontend as a new `apps/` workspace member.

### Milestone 5 — Replace DummyJSON incrementally

Recommended order:

1. Authentication and sessions.
2. Customers.
3. Products.
4. Invoices and invoice items.
5. Payments.
6. Dashboard aggregates.
7. Reports.
8. Team, roles, and audit logs.

Retire each DummyJSON mapper and mock only after its replacement has contract and end-to-end coverage.

## 15. Recommended Improvements

### Highest priority

1. **Finish routing existing invoice work.** The invoice feature layer is much further along than its route; exposing and testing it produces immediate value before adding new modules.
2. **Harden the API boundary.** Introduce a reusable fetch wrapper for base URL, typed errors, JSON parsing, abort signals, and consistent validation. Keep feature mappers, but avoid repeating transport behavior.
3. **Add tests before backend migration.** Mapper and total-calculation tests protect the domain behavior while API providers change.
4. **Replace client-readable auth tokens in Stage 2.** Adopt server-issued `HttpOnly` cookies and backend authorization before treating the application as production-ready.
5. **Complete operational files.** Empty `README.md`, `.env.example`, and `docker-compose.yml` currently imply capabilities that do not yet exist.

### Architecture and maintainability

- Add explicit `typecheck` scripts; lint and production builds are not substitutes for a fast type-check task.
- Use React Hook Form only if the growing customer/product/invoice forms benefit from its field and error management; otherwise update the documented stack to match the chosen approach.
- Keep server/domain DTOs separate and validate all untrusted API responses, including dashboard and current-user responses.
- Centralize roles and permissions in a capability matrix so navigation visibility, route UX, and backend authorities use the same vocabulary.
- Define an invoice state machine (`draft`, `issued`, `partially_paid`, `paid`, `overdue`, `void`) instead of allowing arbitrary status changes.
- Treat invoice finalization and payment recording as transactional backend commands, not generic CRUD updates.
- Add audit fields (`created_at`, `updated_at`, `created_by`, `updated_by`) to core records from the first migration.

### Product and user experience

- Clarify whether “analytics” and “reports” have different users and outcomes; merge them if the distinction is not meaningful.
- Add product navigation only when the product module exists, or document why products are managed indirectly through invoice creation.
- Preserve filters in the URL so lists are bookmarkable and browser navigation works naturally.
- Design for keyboard operation, visible focus, semantic labels, responsive tables, and color-independent status indicators.
- Define export limits, timezone, locale, currency, decimal rounding, and invoice numbering before report and payment work.

## 16. Definition of Done

A feature is complete when:

- Its route uses the intended feature view rather than placeholder markup.
- Loading, empty, error, success, validation, and permission states are handled.
- External data is validated and mapped at the boundary.
- Business-critical behavior has automated tests.
- Accessibility and responsive behavior have been checked.
- Relevant environment variables and setup steps are documented.
- Temporary DummyJSON behavior is clearly marked and has a Stage 2 replacement path.

The MVP is complete when users can securely authenticate, manage customers and products, create and track invoices and payments, view accurate dashboard data, export core reports, and run the full system with PostgreSQL through documented Docker Compose commands.

## 17. Planned Extension: Self-Service Customer Portal (Storefront)

Drafted July 29, 2026; not yet implemented. Adds a third client application on top of the existing shared `apps/core-api` backend, rather than a second backend.

### 17.1 Why a third app, not a second backend

- `apps/back-office-portal` is the staff back-office: internal users (`User`/`Role`) manage customers, invoices, and products.
- The new storefront is public-facing: shoppers browse products, register their own account, place orders, and view their own invoices.
- Both share the same `apps/core-api` Spring Boot service and PostgreSQL database — no data sync or duplication between systems.

### 17.2 Two parallel identities, one security config

| | Staff (existing) | Customer (planned) |
| --- | --- | --- |
| Identity | `User` + `Role` (`SUPER_ADMIN`/`SHOP_ADMIN`/`STAFF`) | `Customer`, extended with `passwordHash` (nullable) and `emailVerified` |
| Login | `/api/v1/auth/login` | `/api/v1/storefront/auth/register`, `/login` |
| Security | existing `SecurityFilterChain` in `SecurityConfig` | new `SecurityFilterChain`, matched on `/api/v1/storefront/**` |
| Authorization | `hasAnyRole(...)` | resource-ownership check (`invoice.customerId == token.customerId`) |

`Customer` does not get a `Role` value. Mixing staff permission levels with self-service customer accounts was rejected: it would force every authorization check to special-case customers instead of keeping two clean identity models.

### 17.3 Order → Invoice flow

- New `Order`/`OrderItem` entities (new `order` module) capture what the customer bought, with a `unitPriceSnapshot` on each line so later `Product` price changes never retroactively affect a placed order.
- Checkout auto-generates the `Invoice`/`InvoiceItem`s in the same transaction — no staff confirmation step. `Order.status`: `PENDING → INVOICED` or `→ CANCELLED`.
- `Invoice` gets an `order` FK, kept nullable so back-office staff can still raise a manual invoice with no order behind it.
- Email verification is deferred: `emailVerified` is stored at registration but not yet enforced before checkout.

### 17.4 New endpoints (draft)

- Storefront: `POST /api/v1/storefront/auth/register`, `/login`; `GET /api/v1/storefront/products` (public catalog); `POST`/`GET /api/v1/storefront/orders`; `GET /api/v1/storefront/invoices`.
- Staff (existing pattern): `orders` (list/get/cancel), `invoices` (list/get/void/mark-paid), `products` (CRUD) — all still to be built since these modules are currently empty scaffolds.

### 17.5 Not yet decided

- Storefront frontend stack and repository location (new `apps/` workspace member, presumably Next.js to match `apps/back-office-portal`).
- Payment gateway integration for storefront checkout (out of MVP scope per Section 9 today).
- Whether storefront product-catalog browsing (`GET`) requires authentication at all, or is fully public.
