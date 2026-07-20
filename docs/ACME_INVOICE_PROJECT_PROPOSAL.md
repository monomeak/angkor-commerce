# Acme Invoice Management System
## Full-Stack Learning Project Proposal

## 1. Project Overview

The **Acme Invoice Management System** is a production-style full-stack web application for managing customers, products, invoices, payments, dashboard analytics, and business reports.

The project is designed as a hands-on learning system built in two main stages:

1. **Frontend development with Next.js and DummyJSON**
2. **Backend development with Java Spring Boot and PostgreSQL**

During the first stage, DummyJSON acts as a temporary REST API so the complete frontend architecture and user experience can be developed before the real backend is available.

During the second stage, DummyJSON will be replaced feature by feature with a Spring Boot REST API backed by PostgreSQL.

---

## 2. Project Objectives

The project aims to provide practical experience with:

- Next.js App Router
- Responsive dashboard development
- Authentication and protected routes
- Server-state management with TanStack React Query
- Form management with React Hook Form
- Schema validation with Zod
- Component development with shadcn/ui
- REST API integration
- Java Spring Boot backend development
- Spring Security and role-based access control
- PostgreSQL relational database design
- API documentation with Swagger/OpenAPI
- Containerization with Docker
- Automated frontend, backend, API, and end-to-end testing

---

## 3. Project Scope

The system will allow authenticated users to:

- Log in and log out.
- View dashboard statistics.
- Manage customers.
- Manage products.
- Create and manage invoices.
- Add products as invoice items.
- Track invoice totals and discounts.
- Record and view payments.
- Search, filter, sort, and paginate data.
- View reports and export selected data.
- Download invoice and financial reports.
- Manage users and roles according to permission rules.

---

## 4. Development Strategy

The project is divided into two major stages.

## Stage 1: Frontend with DummyJSON

The first stage focuses on building the complete frontend independently from the real backend.

```text
Browser
   |
   v
Next.js Frontend
   |
   | HTTP requests
   v
DummyJSON API
```

DummyJSON resources will be mapped to the project domain:

| DummyJSON Resource | Project Domain |
| --- | --- |
| Users | Customers |
| Products | Products |
| Carts | Invoices |
| Cart products | Invoice items |
| Cart total | Gross invoice total |
| Discounted total | Net invoice total |

Some project-specific fields that are missing from DummyJSON will be temporarily generated or mapped by the frontend.

Examples:

- Invoice number
- Invoice status
- Issue date
- Due date
- Payment status
- User roles

DummyJSON create, update, and delete operations are simulated and are not permanently persisted. This limitation will be documented and handled during frontend development.

### Stage 1 Goals

- Establish the frontend project architecture.
- Build authentication screens and session handling.
- Build the dashboard shell and navigation.
- Integrate DummyJSON with a reusable API layer.
- Implement TanStack React Query.
- Build customer, product, and invoice features.
- Implement loading, error, empty, and success states.
- Add search, filtering, sorting, and pagination.
- Add frontend validation.
- Add automated frontend and end-to-end tests.

---

## Stage 2: Backend with Spring Boot

The second stage introduces the real backend and database.

```text
Browser
   |
   v
Next.js Frontend
   |
   | REST API
   v
Spring Boot Backend
   |
   | Spring Data JPA
   v
PostgreSQL Database
```

DummyJSON will be replaced feature by feature.

Recommended replacement order:

1. Authentication
2. Customers
3. Products
4. Invoices
5. Payments
6. Dashboard statistics
7. Reports
8. Users and roles
9. Audit logs

The frontend UI should remain mostly unchanged because API access will be isolated behind service functions and feature hooks.

---

## 5. Technology Stack

## Frontend

- Next.js
- React
- TypeScript
- Tailwind CSS
- shadcn/ui
- TanStack React Query
- React Hook Form
- Zod
- Axios or Fetch API
- Recharts
- Sonner
- Lucide Icons

## Backend

- Java 21
- Spring Boot
- Spring Web
- Spring Data JPA
- Spring Security
- Bean Validation
- Hibernate
- PostgreSQL Driver
- Flyway
- Springdoc OpenAPI
- Maven Wrapper

## Testing

- Vitest or Jest
- React Testing Library
- Playwright
- JUnit 5
- Mockito
- Spring Boot Test
- MockMvc
- Testcontainers
- Postman

## Infrastructure

- Docker
- Docker Compose
- PostgreSQL
- Optional JSReport or Java PDF library
- Optional Nginx reverse proxy

---

## 6. Repository Strategy

The project will use a **monorepo**.

The frontend and backend will stay in one Git repository but use independent build systems.

```text
acme-invoice-management/
├── apps/
│   ├── web/
│   └── api/
├── tests/
│   └── e2e/
├── docs/
├── infrastructure/
├── scripts/
├── docker-compose.yml
├── pnpm-workspace.yaml
├── package.json
├── .env.example
├── .gitignore
└── README.md
```

### Build Ownership

| Application | Build Tool |
| --- | --- |
| Next.js frontend | pnpm |
| Spring Boot backend | Maven Wrapper |
| PostgreSQL and services | Docker Compose |
| End-to-end testing | Playwright |

Spring Boot will not be treated as a pnpm workspace package.

The root repository coordinates the applications, documentation, Docker services, and end-to-end tests.

---

## 7. Recommended Repository Structure

```text
acme-invoice-management/
├── apps/
│   ├── web/
│   │   ├── src/
│   │   ├── public/
│   │   ├── package.json
│   │   ├── next.config.ts
│   │   ├── Dockerfile
│   │   └── .dockerignore
│   │
│   └── api/
│       ├── src/
│       │   ├── main/
│       │   └── test/
│       ├── pom.xml
│       ├── mvnw
│       ├── mvnw.cmd
│       ├── Dockerfile
│       └── .dockerignore
│
├── tests/
│   └── e2e/
│
├── docs/
│   ├── project-proposal.md
│   ├── architecture.md
│   ├── api-contract.md
│   ├── database-design.md
│   └── test-plan.md
│
├── infrastructure/
│   ├── postgres/
│   ├── jsreport/
│   └── nginx/
│
├── docker-compose.yml
├── pnpm-workspace.yaml
├── package.json
├── .env.example
├── .gitignore
└── README.md
```

Each application keeps its own Dockerfile near its source code.

---

## 8. Frontend Architecture

Recommended frontend structure:

```text
apps/web/src/
├── app/
│   ├── (auth)/
│   ├── (dashboard)/
│   ├── layout.tsx
│   ├── page.tsx
│   ├── loading.tsx
│   ├── error.tsx
│   └── not-found.tsx
│
├── components/
│   ├── ui/
│   ├── common/
│   └── layout/
│
├── features/
│   ├── auth/
│   ├── dashboard/
│   ├── customers/
│   ├── products/
│   ├── invoices/
│   ├── payments/
│   ├── reports/
│   └── users/
│
├── providers/
├── hooks/
├── lib/
├── schemas/
└── types/
```

### Frontend Data Flow

```text
Page
  |
  v
Feature component
  |
  v
React Query hook
  |
  v
Service function
  |
  v
API client
  |
  v
DummyJSON or Spring Boot
```

UI components must not call DummyJSON directly.

This architecture allows the backend provider to change without rewriting the pages.

---

## 9. State Management Strategy

| State Type | Recommended Tool |
| --- | --- |
| Server and API data | TanStack React Query |
| Form values | React Hook Form |
| Form validation | Zod |
| URL filters and pagination | Search parameters |
| Small component state | React `useState` |
| Authentication profile | React Query |
| Sidebar and layout state | React context or shadcn sidebar |
| Theme | next-themes |

Redux or Zustand will not be added initially because React Query, URL state, form state, and local React state are sufficient.

---

## 10. Frontend Routes

```text
/login
/dashboard
/dashboard/customers
/dashboard/customers/create
/dashboard/customers/[id]
/dashboard/customers/[id]/edit
/dashboard/products
/dashboard/products/create
/dashboard/products/[id]
/dashboard/products/[id]/edit
/dashboard/invoices
/dashboard/invoices/create
/dashboard/invoices/[id]
/dashboard/invoices/[id]/edit
/dashboard/payments
/dashboard/reports
/dashboard/users
/dashboard/settings
```

---

## 11. Authentication

## Stage 1 Authentication

DummyJSON authentication endpoints will be used initially:

```http
POST /auth/login
GET  /auth/me
POST /auth/refresh
```

The frontend will implement:

- Login form
- Validation
- Authentication mutation
- Current-user query
- Logout flow
- Protected dashboard pages
- Token refresh handling
- Unauthorized-response handling

## Stage 2 Authentication

Spring Boot will provide:

```http
POST /api/v1/auth/login
POST /api/v1/auth/refresh
POST /api/v1/auth/logout
GET  /api/v1/auth/me
```

The real backend will handle:

- Password hashing
- Access-token generation
- Refresh-token rotation
- Secure cookie configuration
- Session invalidation
- Role-based authorization
- Account status validation

The backend remains the final security authority.

---

## 12. Core Functional Modules

## Dashboard

The dashboard should display:

- Total customers
- Total products
- Total stock
- Low-stock products
- Inventory value
- Total invoices
- Gross revenue
- Net revenue
- Total discount
- Total quantity
- Average invoice
- Top product
- Top customer
- Recent invoices

During Stage 1, these values will be aggregated from DummyJSON users, products, and carts.

During Stage 2, a dedicated Spring Boot dashboard API will return the final values.

## Customer Management

- Customer list
- Customer details
- Create customer
- Edit customer
- Delete or archive customer
- Search
- Sorting
- Pagination
- Customer invoice history

## Product Management

- Product list
- Product details
- Category filtering
- Search
- Sorting
- Pagination
- Create and edit product
- Stock status
- Low-stock indicators

## Invoice Management

- Invoice list
- Invoice details
- Create invoice
- Edit invoice
- Delete or archive invoice
- Add invoice items
- Automatic total calculation
- Discount calculation
- Search and filtering
- Sorting and pagination
- Invoice status display

## Payment Management

- Record payment
- Payment history
- Payment method
- Transaction reference
- Payment date
- Remaining balance
- Automatic paid-status update

## Reports

- Invoice report
- Revenue report
- Product and stock report
- Customer statement
- CSV export
- Print-friendly report
- PDF generation in the backend stage

## User and Role Management

Proposed roles:

- Super Admin
- Shop Admin
- Staff
- Viewer

Permissions will be enforced by Spring Security during the backend stage.

---

## 13. Backend Architecture

Recommended package structure:

```text
apps/api/src/main/java/com/acme/invoice/
├── auth/
├── user/
├── role/
├── customer/
├── product/
├── invoice/
├── payment/
├── dashboard/
├── report/
├── audit/
├── security/
├── common/
└── config/
```

Typical feature structure:

```text
invoice/
├── InvoiceController.java
├── InvoiceService.java
├── InvoiceRepository.java
├── InvoiceEntity.java
├── InvoiceItemEntity.java
├── InvoiceMapper.java
├── CreateInvoiceRequest.java
├── UpdateInvoiceRequest.java
└── InvoiceResponse.java
```

The backend will follow:

```text
Controller
   |
   v
Service
   |
   v
Repository
   |
   v
PostgreSQL
```

Controllers should remain thin, while business rules belong in services.

---

## 14. Suggested Database Tables

- users
- roles
- user_roles
- customers
- products
- invoices
- invoice_items
- payments
- refresh_tokens
- report_logs
- audit_logs

Main relationships:

- A customer has many invoices.
- An invoice belongs to one customer.
- An invoice contains many invoice items.
- An invoice can have multiple payments.
- A user can create invoices and payments.
- A user can generate reports.
- A user can create audit-log records through system actions.

---

## 15. API Contract Strategy

Because the frontend uses TypeScript and the backend uses Java, shared TypeScript packages will not be used as the source of truth.

Instead, OpenAPI will define the shared contract.

```text
Spring Boot DTOs
      |
      v
Springdoc OpenAPI
      |
      v
openapi.json
      |
      v
Generated TypeScript client and types
      |
      v
Next.js frontend
```

Possible frontend client generators:

- openapi-typescript
- Orval
- Hey API

This reduces contract drift between Java and TypeScript.

---

## 16. Environment Configuration

The repository will provide a root `.env.example`.

Example variables:

```env
NEXT_PUBLIC_APP_NAME=Acme Invoice Management
NEXT_PUBLIC_APP_ENV=development
NEXT_PUBLIC_API_BASE_URL=https://dummyjson.com
NEXT_PUBLIC_USE_DUMMY_API=true

SERVER_PORT=8080

POSTGRES_DB=acme_invoice
POSTGRES_USER=acme
POSTGRES_PASSWORD=change_me

SPRING_DATASOURCE_URL=jdbc:postgresql://postgres:5432/acme_invoice
SPRING_DATASOURCE_USERNAME=acme
SPRING_DATASOURCE_PASSWORD=change_me

JWT_SECRET=replace_with_a_long_random_secret
CORS_ALLOWED_ORIGINS=http://localhost:3000
```

Only `.env.example` files will be committed.

Secrets and local environment files will be ignored by Git.

---

## 17. Docker Strategy

Each application will keep its Dockerfile beside its source:

```text
apps/web/Dockerfile
apps/api/Dockerfile
```

The root `docker-compose.yml` will coordinate:

- Next.js
- Spring Boot
- PostgreSQL
- Optional JSReport
- Optional Nginx

The first frontend stage may run locally without Docker.

Docker Compose will become a required part of the project when the Spring Boot backend and PostgreSQL are introduced.

---

## 18. Git Branch Strategy

Main branches:

```text
main
develop
```

Feature branches:

```text
feature/frontend-foundation
feature/frontend-authentication
feature/dashboard-layout
feature/dashboard-overview
feature/customer-management
feature/product-management
feature/invoice-management
feature/frontend-reports
test/frontend-automation

feature/backend-foundation
feature/backend-authentication
feature/backend-customer-api
feature/backend-product-api
feature/backend-invoice-api
feature/backend-payment-api
feature/backend-dashboard-api
feature/backend-reports
test/backend-integration
```

Full-stack features may use one branch containing frontend, backend, migration, documentation, and test changes.

Example:

```text
feature/invoice-creation
```

---

## 19. Commit Convention

Examples:

```text
feat(web): add customer listing page
feat(api): add customer search endpoint
fix(web): handle expired access token
fix(api): validate invoice due date
test(e2e): cover invoice creation flow
test(api): add invoice controller tests
docs: update architecture proposal
chore(infra): add postgres health check
```

---

## 20. Testing Strategy

## Frontend Testing

- Component tests
- Form-validation tests
- React Query integration tests
- API error-state tests
- Loading and empty-state tests

## Backend Testing

- Unit tests
- Controller tests
- Service tests
- Repository integration tests
- Security tests
- Validation tests
- Testcontainers with PostgreSQL

## API Testing

Postman will be used to test:

- Request bodies
- Path parameters
- Query parameters
- Authentication
- Validation errors
- Authorization
- Pagination
- Sorting
- Filtering
- Business rules

## End-to-End Testing

Playwright will cover:

- Login
- Protected-route access
- Customer creation
- Product creation
- Invoice creation
- Invoice item calculation
- Payment recording
- Search and filtering
- Dashboard totals
- Report downloads
- Logout

---

## 21. Development Milestones

## Milestone 1: Frontend Foundation

- Set up monorepo.
- Move Next.js into `apps/web`.
- Configure pnpm workspace.
- Install shadcn/ui.
- Configure TanStack React Query.
- Add environment validation.
- Add API client.
- Create route groups.
- Create dashboard shell.

## Milestone 2: DummyJSON Authentication

- Build login page.
- Connect DummyJSON authentication.
- Add current-user query.
- Add logout.
- Protect dashboard routes.
- Handle expired sessions.

## Milestone 3: Dashboard

- Add dashboard cards.
- Add charts.
- Aggregate DummyJSON data.
- Add recent-invoice table.
- Add loading and error states.

## Milestone 4: Customer and Product Management

- Build customer pages.
- Build product pages.
- Add forms.
- Add search, sorting, filters, and pagination.
- Add create, edit, and delete simulations.

## Milestone 5: Invoice Management

- Map carts to invoices.
- Build invoice list and detail pages.
- Build invoice create and edit forms.
- Add invoice items.
- Add calculated totals.
- Add generated invoice fields.

## Milestone 6: Frontend Reports and Tests

- Add report views.
- Add CSV export.
- Add print-friendly pages.
- Add component tests.
- Add Playwright tests.

## Milestone 7: Spring Boot Foundation

- Generate Spring Boot application.
- Configure Maven.
- Configure PostgreSQL.
- Add Flyway.
- Add health endpoint.
- Add Swagger.
- Add global exception handling.

## Milestone 8: Backend Features

- Add authentication.
- Add customers.
- Add products.
- Add invoices and invoice items.
- Add payments.
- Add dashboard aggregation.
- Add reports.
- Add users and roles.

## Milestone 9: Replace DummyJSON

- Replace authentication service.
- Replace customer service.
- Replace product service.
- Replace invoice service.
- Replace dashboard service.
- Remove temporary mappers and generated fields.

## Milestone 10: Full-System Testing and Docker

- Add backend integration tests.
- Add Testcontainers.
- Add Dockerfiles.
- Add Docker Compose.
- Run complete Playwright suite.
- Add CI pipeline.
- Finalize documentation.

---

## 22. MVP Scope

The MVP should include:

- Login and logout
- Protected dashboard
- Responsive sidebar and header
- Customer list and forms
- Product list and forms
- Invoice list and forms
- Invoice items
- Automatic invoice totals
- Search, filtering, sorting, and pagination
- Basic payment recording
- Dashboard summary
- CSV export
- PostgreSQL persistence
- Swagger documentation
- Docker Compose
- Basic automated tests

The MVP should not initially include:

- Multi-company support
- Multiple currencies
- Recurring invoices
- Advanced accounting
- Complex tax rules
- Subscription billing
- Real-time notifications
- Advanced audit reporting
- External payment-gateway integration

---

## 23. Success Criteria

The project is considered successful when:

- The frontend works with DummyJSON during Stage 1.
- The frontend architecture does not depend directly on DummyJSON.
- The system can replace DummyJSON with Spring Boot feature by feature.
- Users can authenticate and access protected pages.
- Customers and products can be managed.
- Invoices can contain multiple items.
- Totals are calculated correctly.
- Payments update invoice balances and statuses.
- Dashboard values match database records.
- Swagger documents the backend APIs.
- PostgreSQL stores the final business data.
- Docker Compose runs the complete system.
- Automated tests cover the main business flows.
- The README explains setup, architecture, scripts, testing, and learning outcomes.

---

## 24. Expected Learning Outcomes

After completing the project, the developer should understand:

- How to organize a mixed-technology monorepo.
- How Next.js consumes external and internal APIs.
- How TanStack React Query manages server state.
- How shadcn/ui supports reusable frontend design.
- How frontend validation and backend validation differ.
- How Spring Boot organizes controllers, services, and repositories.
- How Spring Security protects APIs.
- How JPA and PostgreSQL manage relational data.
- How OpenAPI synchronizes Java and TypeScript contracts.
- How Docker coordinates frontend, backend, and database services.
- How unit, integration, API, and end-to-end tests work together.

---

## 25. Final Project Definition

The **Acme Invoice Management System** is a full-stack business application built with Next.js, Java Spring Boot, PostgreSQL, and Docker.

Its frontend will first be developed and tested with DummyJSON. The real Spring Boot backend will then replace the temporary API feature by feature.

The project uses a monorepo for organization and coordination while keeping pnpm and Maven as independent build systems.
