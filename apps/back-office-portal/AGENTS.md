<!-- BEGIN:nextjs-agent-rules -->
# Angkor Commerce — apps/back-office-portal

Frontend for Angkor Commerce. See [`docs/ANGKOR_COMMERCE_PROJECT_PROPOSAL.md`](../../docs/ANGKOR_COMMERCE_PROJECT_PROPOSAL.md) at the repo root for the project vision, roles, and architecture — treat it as the source of truth over this file for anything not covered here.

## Stack

Next.js 16 App Router, React 19, TypeScript 5, Tailwind CSS 4, shadcn/ui, Base UI, TanStack React Query 5, TanStack React Table 8, React Hook Form 7 + `@hookform/resolvers`, Zod 4, Recharts 3, Sonner, Lucide React. Auth, the product catalogue and the customer directory now talk to the shared Spring Boot API (`apps/core-api`) through `lib/api-client.ts`; the dashboard, invoices, reports and profile features are still on DummyJSON-shaped mock data and have not been ported yet.

## Structure and conventions

- Routes live in `app/`; feature code lives in `src/features/<feature>/` (`api/`, `components/`, `hooks/`, `lib/`, `mappers/`, `schemas/`, `types/`, `views/`). Keep `app` and `src` separate — don't move one under the other without a deliberate migration.
- Route pages compose feature views and stay small; feature views hold the logic.
- Data flow per feature: route page → view/component → React Query hook → API function → Zod validation/mapper → DummyJSON (Stage 1) or Spring Boot (Stage 2).
- UI components must not call DummyJSON (or any transport) directly — always go through a feature's API function.
- DummyJSON response shapes stay separate from domain types; validate external responses with Zod before mapping into domain objects.
- Query keys are owned by the feature that defines them.
- Config reaches the browser through `lib/env.ts` (server-side `process.env` parsing) → `lib/app-config.server.ts` (the public `AppConfig` shape) → `<AppConfigProvider>`. No `NEXT_PUBLIC_*`, so one build runs in every environment; secrets stay in `lib/env.ts` and must never enter `AppConfig`.
- `AppConfig` is only readable from a hook, so api functions take `apiBaseUrl` as their first argument and the calling hook supplies it via `useAppConfig()`. Never call `useAppConfig()` at module scope — it throws on import.
- URL search params are the source of truth for shareable list filters and pagination.
- Forms use React Hook Form + `zodResolver`. This replaced the earlier local-state + Zod approach when the catalogue landed: repeatable variant rows need `useFieldArray`, and PATCH-diffing needs `formState.dirtyFields`. Older features (profile, team) still use local state — port them when touched rather than in bulk.
- shadcn here is the Base UI (`base-nova`) registry: components take `render={<Component />}` rather than `asChild`, and there is no `form.tsx` — build forms from `field.tsx` (`Field`, `FieldLabel`, `FieldError`) plus React Hook Form.

## Current state (see proposal doc for details)

Implemented against core-api: login/logout/session via httpOnly cookies (`/auth/*`), the catalogue module under `src/features/catalog/` — `products/` (list with URL-param filters, sort and pagination; create; edit with PATCH diffing; variant rows; image upload; archive/restore), `categories/` (list, create, edit, delete) and `inventory/` (stock grouped per category card) — and `customers/` (read-only directory: search, status filter, sortable columns, pagination, details dialog).

The customer directory mirrors the product list deliberately: `lib/search-params.ts` + `hooks/use-customer-list-params.ts` are the same shape as the catalogue's, so filters, sort and page live in the URL and core-api does the work. Three things differ from products and are worth knowing:

- The search parameter is **`search`**, not `q` — that is what `/customers` has always taken.
- `GET /customers` and `GET /customers/{id}` return the *same* CustomerResponse, so one `Customer` type covers list rows and the details dialog; there is no summary/detail split like products have.
- The table is hand-rolled rather than TanStack Table (the catalogue's `ProductTable` is typed to `ProductSummary` and not shared); sortable headers are a local `SortableHead` component. `displayName` is computed in Java, not a column, so it cannot be sorted on — the Customer column sorts by `firstName`.

core-api has no admin write endpoints for customers (only the two GETs), so the directory is read-only by design, not by omission. Customers are created by storefront self-registration.

Still on mock data: landing page, dashboard overview, invoice feature layer, profile + appearance/privacy settings, reports. Reports looks customers up through the ported `customers` API but feeds it DummyJSON invoice user ids, so most of those lookups 404 and the rows fall back to "Customer #id" until invoices are ported.

Placeholder routes with little/no view wired up: `/invoices` (feature layer exists, not routed), `/reports`, `/analytics`, `/team`.

Self-service registration is disabled: core-api's back-office `AuthController` has no `/register`, so `registerRequest()` throws a 501 with an explanation. Staff accounts come from the admin-only `POST /users`.

Auth tokens are server-issued `HttpOnly` cookies set by core-api on the API origin — the client never reads or stores them, and `apiFetch` sends them with `credentials: "include"`, refreshing once on a 401.

One caveat to know about `proxy.ts`: those cookies are host-only (no `Domain`), and cookies ignore ports, so in dev they reach the Next.js middleware. Once core-api moves to its own hostname they will not, and the route gate will stop seeing a session — at that point either scope the cookies to a shared parent domain or move the checks client-side.
<!-- END:nextjs-agent-rules -->
