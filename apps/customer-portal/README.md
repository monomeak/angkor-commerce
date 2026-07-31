# customer-portal

Customer-facing storefront / self-service portal for Angkor Commerce — self-registration, browsing, and order/invoice viewing against the shared `apps/core-api` backend.

Freshly scaffolded (`create-next-app`); not yet wired to any API. See [`docs/ANGKOR_COMMERCE_PROJECT_PROPOSAL.md`](../../docs/ANGKOR_COMMERCE_PROJECT_PROPOSAL.md#17-planned-extension-self-service-customer-portal-storefront) at the repo root for the intended design.

## Getting started

Run from the repo root so the pnpm workspace resolves correctly:

```bash
pnpm install
pnpm dev:customer-portal
```

Or from this directory: `pnpm dev`. Open [http://localhost:3000](http://localhost:3000).
