# back-office-portal

Staff dashboard for Angkor Commerce — invoices, customers, payments, team, and reporting.

## Stack

Next.js 16 App Router, React 19, TypeScript 5, Tailwind CSS 4, shadcn/ui, Base UI, TanStack React Query 5, Zod 4, next-intl (`en`/`km`), Recharts, Sonner, Lucide React.

Talks to DummyJSON for features not yet backed by `apps/core-api`; auth, users, and customers already go through the real Spring Boot API.

## Getting started

Run from the repo root so the pnpm workspace resolves correctly:

```bash
pnpm install
pnpm dev:back-office
```

Or from this directory: `pnpm dev`. Requires `NEXT_PUBLIC_API_BASE_URL` and `NEXT_PUBLIC_NODE_ENV` (see `.env.example`).

Open [http://localhost:3000](http://localhost:3000).

## Conventions

See [`AGENTS.md`](AGENTS.md) for the feature-folder structure, data-flow rules, and current implementation status. For the full proposal, architecture rationale, and delivery roadmap, see [`docs/ANGKOR_COMMERCE_PROJECT_PROPOSAL.md`](../../docs/ANGKOR_COMMERCE_PROJECT_PROPOSAL.md) at the repo root.
