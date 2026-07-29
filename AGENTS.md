# Angkor Commerce - AI Agent Guide

Use this file as the first source of project-specific instructions when working in this repository. For frontend-only work, also read `apps/back-office-portal/AGENTS.md`.

## Project Overview

Angkor Commerce is a personal learning project, not a real company's production app: a full invoice management system (customers, products, invoices, payments, reporting) built end-to-end as a pnpm/Turborepo monorepo to practice a modern full-stack toolset deliberately, one layer at a time.

It's being built in two stages:

- **Stage 1 (done):** a Next.js frontend wired to DummyJSON, a public fake REST API, standing in for a real backend. This let the UI, auth flow, and feature layer get built and reviewed before any backend existed.
- **Stage 2 (in progress):** a real Spring Boot + PostgreSQL backend (`apps/core-api`) that replaces DummyJSON one feature at a time. `customer` is the first slice built end-to-end (entity, repository, read endpoint); everything else in `apps/back-office-portal` still points at DummyJSON until its backend counterpart lands.

Structure:

- `apps/back-office-portal`: Next.js dashboard and public landing page — the actual product UI.
- `apps/core-api`: Spring Boot API, Java 21, PostgreSQL, JPA/Hibernate.
- `docs`: project proposal, roadmap, and `docs/learning-notes/` — plain-language write-ups of *why* each backend decision was made. Read these before assuming a choice (like Hibernate-generated schema over Flyway) was arbitrary or a shortcut.
- `docker-compose.yml`: local PostgreSQL plus API service.

Because this is explicitly a learning project, some choices favor "understand the mechanism hands-on" over "production best practice" — e.g. `ddl-auto=update` instead of Flyway migrations for now (see `docs/learning-notes/03-why-flyway-sql-instead-of-jpa-entities.md`). Don't silently "fix" these toward conventional production patterns; the point is to build and see the mechanism work.

## Current Stack

Frontend:

- Next.js 16 App Router, React 19, TypeScript 5.
- Tailwind CSS 4, shadcn/ui, Base UI, Lucide React.
- TanStack React Query 5 for server state.
- Zod 4 for response and form validation.
- next-intl for `en` and `km` messages.
- DummyJSON remains the temporary remote API for Stage 1 frontend flows.

Backend:

- Java 21.
- Spring Boot 4, Spring Web MVC, Spring Security, Spring Data JPA, Validation, Actuator.
- PostgreSQL.
- springdoc OpenAPI UI at `/swagger-ui.html`.
- Maven Wrapper owns backend builds; do not add `apps/core-api` to `pnpm-workspace.yaml`.

## Commands

Run frontend tasks from the repo root unless there is a reason to work inside `apps/back-office-portal`.

```bash
pnpm dev
pnpm build
pnpm lint
pnpm dev:web
pnpm build:web
pnpm lint:web
```

Run backend tasks from `apps/core-api`.

```bash
./mvnw spring-boot:run
./mvnw test
./mvnw package
```

Run local infrastructure from the repo root.

```bash
docker compose up -d postgres
docker compose up --build api
```

Use `.env.example` as the template for local environment variables.

## Repository Rules

- Preserve the monorepo boundary: pnpm/Turborepo coordinates frontend tasks, Maven coordinates backend tasks.
- Keep route files small. Next.js pages should compose feature views rather than owning business logic.
- Keep feature code under `apps/back-office-portal/src/features/<feature>/` with local `api`, `components`, `hooks`, `lib`, `mappers`, `schemas`, `types`, and `views` folders when needed.
- Keep shared frontend utilities under `apps/back-office-portal/src/shared` or `apps/back-office-portal/lib` depending on the existing local pattern.
- Keep backend code organized by domain package under `com.acme.invoice`, such as `customer`, `invoice`, `payment`, `product`, `dashboard`, `report`, `audit`, `auth`, `user`, `security`, `config`, and `common`.
- Do not introduce broad refactors while implementing a feature. Match the current file layout and naming style.
- Do not overwrite unrelated working tree changes. Check `git status --short` before broad edits.

## Frontend Guidelines

- Follow `apps/back-office-portal/AGENTS.md` for detailed frontend rules.
- External API response shapes must stay separate from domain types.
- Validate external responses with Zod before mapping them into domain models.
- Feature hooks should own TanStack Query usage and query keys.
- UI components should not call DummyJSON or backend endpoints directly.
- Use URL search params as the source of truth for shareable filters, sorting, and pagination.
- Keep `messages/en.json` and `messages/km.json` in sync when adding user-facing copy.
- Use existing shadcn/ui components and Lucide icons before creating new primitives.
- Do not add React Hook Form unless the project explicitly adopts it; current forms use local state plus Zod.
- Treat localStorage and JavaScript-readable auth cookies as Stage 1 prototype behavior only. Do not extend that pattern for production auth.

## Backend Guidelines

- Use constructor injection.
- Keep controllers thin. Put business rules in services once logic grows beyond simple repository reads.
- Use request and response DTOs at API boundaries; do not expose JPA entities directly from new endpoints.
- Use Jakarta Validation annotations on request DTOs.
- Prefer explicit REST paths under `/api/...`; keep naming consistent with existing `CustomerController`.
- Keep Spring Security as the final authorization authority. Frontend role checks are for user experience only.
- Schema is generated from JPA `@Entity` classes via `spring.jpa.hibernate.ddl-auto=update` (deliberate choice, for hands-on JPA/Hibernate learning — see `docs/learning-notes/03-why-flyway-sql-instead-of-jpa-entities.md`). It only adds tables/columns, never drops or renames; if a field is renamed, remove the old column by hand. Reintroduce Flyway/Liquibase before production.
- Avoid committing real credentials. Defaults in `.env.example` are local development placeholders only.
- When adding endpoints, update or verify OpenAPI output.

## Testing And Verification

Before finishing code changes, run the smallest useful verification command:

- Frontend-only change: `pnpm lint:web` and, when behavior or types changed, `pnpm build:web`.
- Backend-only change: `cd apps/core-api && ./mvnw test`.
- Cross-stack change: run the relevant frontend and backend checks.
- Documentation-only change: no test run is required, but inspect the rendered Markdown structure mentally for broken paths or stale claims.

If a verification command cannot run because dependencies, Docker, network access, or local services are unavailable, state that clearly in the final response.

## Documentation Sources

- `README.md`: proposal-style project overview and roadmap.
- `docs/ANGKOR_COMMERCE_PROJECT_PROPOSAL.md`: fuller proposal and architecture notes.
- `docs/learning-notes/`: beginner-oriented notes about the backend and project setup.
- `apps/back-office-portal/AGENTS.md`: frontend-specific AI agent instructions.

When docs disagree with code, treat the code and package files as current, then update docs or mention the mismatch if it affects the task.
