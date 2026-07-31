<!-- BEGIN:nextjs-agent-rules -->
# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` before writing any code. Heed deprecation notices.
<!-- END:nextjs-agent-rules -->

# Angkor Commerce — apps/customer-portal

Public storefront for Angkor Commerce: browsing, self-registration, and order/invoice viewing against the shared `apps/core-api` backend. See [`docs/ANGKOR_COMMERCE_PROJECT_PROPOSAL.md`](../../docs/ANGKOR_COMMERCE_PROJECT_PROPOSAL.md#17-planned-extension-self-service-customer-portal-storefront) (Section 17) and [`docs/NEXTJS_MIGRATION_PLAN.md`](../../docs/NEXTJS_MIGRATION_PLAN.md) at the repo root for design intent and the phased migration plan — treat them as the source of truth over this file for anything not covered here.

## Stack

Next.js 16 App Router, React 19, TypeScript 5, Tailwind CSS 4, shadcn/ui (`base-nova` style, neutral base color — matches `apps/back-office-portal`), TanStack React Query 5, Zod 4. No backend integration yet; product data is local mock data shaped like future HTTP calls.

## Structure and conventions

Mirrors `apps/back-office-portal`:

- Routes live in `app/`; feature code lives in `src/features/<feature>/` (`api/`, `data/`, `hooks/`, `lib/`, `types/`, and `mappers/`/`schemas/` once a real API exists). Keep `app` and `src` separate.
- Route pages compose feature views and stay small; feature logic lives in the feature folder.
- Query keys are owned by the feature that defines them (`src/features/<feature>/lib/query-keys.ts`).
- Theme is a hand-rolled context (`app/providers/theme-provider.tsx`), not `next-themes` — follow that pattern rather than reaching for the `next-themes` package.
- TanStack Query provider/devtools: `app/providers/query-client-providers.tsx`, gated on `process.env.NODE_ENV`.
- Forms use local React state + Zod; React Hook Form and the shadcn `Form` component are not installed — don't add them without checking whether that decision has changed.

## Current state

Phase 1 (scaffold and foundations) only: shadcn/ui initialized and base component set added, TanStack Query wired into `app/layout.tsx`, `products` feature with domain types, mock data, and query hooks. No pages ported from the legacy app yet, no `.env`/API base URL configured, no route protection (`proxy.ts`) — those land in later migration phases per `docs/NEXTJS_MIGRATION_PLAN.md`.
