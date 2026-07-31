<!-- BEGIN:nextjs-agent-rules -->
# Angkor Commerce — apps/back-office-portal

Frontend for Angkor Commerce. See [`docs/ANGKOR_COMMERCE_PROJECT_PROPOSAL.md`](../../docs/ANGKOR_COMMERCE_PROJECT_PROPOSAL.md) at the repo root for the project vision, roles, and architecture — treat it as the source of truth over this file for anything not covered here.

## Stack

Next.js 16 App Router, React 19, TypeScript 5, Tailwind CSS 4, shadcn/ui, Base UI, TanStack React Query 5, Zod 4, Recharts 3, Sonner, Lucide React. Stage 1 talks to DummyJSON; Stage 2 replaces it with the shared Spring Boot API (`apps/core-api` — auth, users, and customers are already implemented there).

## Structure and conventions

- Routes live in `app/`; feature code lives in `src/features/<feature>/` (`api/`, `components/`, `hooks/`, `lib/`, `mappers/`, `schemas/`, `types/`, `views/`). Keep `app` and `src` separate — don't move one under the other without a deliberate migration.
- Route pages compose feature views and stay small; feature views hold the logic.
- Data flow per feature: route page → view/component → React Query hook → API function → Zod validation/mapper → DummyJSON (Stage 1) or Spring Boot (Stage 2).
- UI components must not call DummyJSON (or any transport) directly — always go through a feature's API function.
- DummyJSON response shapes stay separate from domain types; validate external responses with Zod before mapping into domain objects.
- Query keys are owned by the feature that defines them.
- URL search params are the source of truth for shareable list filters and pagination.
- Forms currently use local React state + Zod; React Hook Form is not installed — don't add it without checking whether the stack decision has changed.

## Current state (see proposal doc for details)

Implemented: landing page, login/register (simulated persistence), dashboard overview (mock fallback data), invoice feature layer (types/schema/mapper/hooks/table/filters/details), profile + appearance/privacy settings, route protection via `proxy.ts`.

Placeholder routes with little/no view wired up: `/invoices` (feature layer exists, not routed), `/customers`, `/reports`, `/analytics`, `/team`.

Auth tokens currently live in `localStorage`/readable cookies — acceptable for the Stage 1 prototype only, not a pattern to extend. Stage 2 replaces this with server-issued `HttpOnly` cookies once the Spring Boot API exists.
<!-- END:nextjs-agent-rules -->
