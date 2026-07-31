# customer-portal

Customer-facing storefront / self-service portal for Angkor Commerce — self-registration, browsing, and order/invoice viewing against the shared `apps/core-api` backend.

UI is largely built (home, browse/search, cart, checkout, account) against local mock/localStorage data; not yet wired to the real `apps/core-api` backend. See [`docs/ANGKOR_COMMERCE_PROJECT_PROPOSAL.md`](../../docs/ANGKOR_COMMERCE_PROJECT_PROPOSAL.md) for the overall design and [`docs/CORE_API_DATA_MODEL.md`](../../docs/CORE_API_DATA_MODEL.md) for the storefront data model.

## Getting started

Run from the repo root so the pnpm workspace resolves correctly:

```bash
pnpm install
pnpm dev:customer-portal
```

Or from this directory: `pnpm dev`. Open [http://localhost:3000](http://localhost:3000).
