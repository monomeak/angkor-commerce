# Angkor Commerce

A learning-focused, production-shaped invoice management system — customers, products, invoices, payments, and reporting — built end-to-end as a pnpm/Turborepo monorepo to practice a modern full-stack toolset one layer at a time.

## Structure

| App | What it is |
| --- | --- |
| [`apps/back-office-portal`](apps/back-office-portal) | Staff dashboard — Next.js, the main product UI |
| [`apps/customer-portal`](apps/customer-portal) | Customer-facing storefront/self-service portal — Next.js, newly scaffolded |
| [`apps/core-api`](apps/core-api) | Backend API — Java 21, Spring Boot, PostgreSQL |

Each app owns its own README/AGENTS file for setup and conventions specific to it. `docs/` holds the project-wide details:

- [`docs/ANGKOR_COMMERCE_PROJECT_PROPOSAL.md`](docs/ANGKOR_COMMERCE_PROJECT_PROPOSAL.md) — what the project is, core flows, roles, architecture, tech stack, and current status
- [`docs/learning-notes/`](docs/learning-notes) — write-ups of *why* specific backend decisions were made
- [`AGENTS.md`](AGENTS.md) — instructions for AI coding agents working in this repo

## Getting started

Prerequisites: Node 20+, pnpm 10, Java 21 (for `core-api`), Docker (optional, for PostgreSQL).

```bash
pnpm install
cp .env.example .env   # fill in real values

pnpm dev                    # all frontend apps, via Turborepo
pnpm dev:back-office        # just apps/back-office-portal
pnpm dev:customer-portal    # just apps/customer-portal
```

Backend:

```bash
cd apps/core-api
./mvnw spring-boot:run
```

Or bring up PostgreSQL + the API together:

```bash
docker compose up
```
