---
tags: [spring-boot, jpa, hibernate, flyway, backend, acme-invoice, learning-notes]
date: 2026-07-24
updated: 2026-07-26
---

# Flyway SQL vs. JPA entities — and why this project switched

> **Update (2026-07-26):** this project started with Way 2 below (hand-written Flyway SQL). After review, it switched to Way 1 — JPA `@Entity` classes with Hibernate generating the schema. Reason: this project exists to learn JPA/Hibernate hands-on, and letting Hibernate own the schema means every entity, annotation, and relationship gets written and seen working, instead of being written once in SQL and then just mirrored in Java. The comparison below is kept because the trade-offs are still real — they just got weighted differently once "learning JPA deeply" became the priority over "production-grade migration hygiene."

## Two ways to get your tables

**Way 1 — let Hibernate generate them (what this project does now).** Write Java classes with `@Entity` on them, set `spring.jpa.hibernate.ddl-auto=update`, and at startup Hibernate looks at your classes and creates/adds tables and columns to match. Nothing is deleted automatically — `update` only ever adds.

**Way 2 — write the SQL yourself (what this project did originally).** You write the exact `CREATE TABLE` statements as Flyway migrations. Hibernate is told `ddl-auto=validate` — it never creates anything, it just double-checks your Java classes match what's already there.

## Why Way 1 was picked here

**1. It's the point of the project.** The whole reason for this backend is to learn Spring Data JPA and Hibernate properly — annotations, relationship mapping, cascade behavior, generated schema quirks. Writing the SQL by hand and then mirroring it in Java skips most of that learning.

**2. Faster iteration while the schema is still moving.** Early on, entity shapes change a lot as features get built. With Hibernate managing the schema, adding a field to a class is enough — no separate migration file to write and keep in sync.

**3. One source of truth to look at.** With `ddl-auto=update`, the Java entity *is* the schema definition. There's nothing else to keep in sync with it.

## Why Way 2 was picked originally (still true, just not the priority now)

- **Exact control.** Money columns need exact precision (`NUMERIC(19,4)`), some tables need composite primary keys or specific indexes — all easy to write directly in SQL, harder to coax Hibernate into producing exactly.
- **Safety.** Hibernate can't always tell "rename a column" from "drop this column, add a new one" — a human-reviewed SQL file can't do that by accident.
- **Consistency across machines.** A migration file runs identically everywhere. Hibernate re-derives the schema from whatever code is currently checked out.
- **Seed data.** Flyway migrations can `INSERT` starter rows (e.g. default roles) as part of the same file. Hibernate schema generation doesn't do data.

These are the reasons a real production system would normally still reach for Flyway (or Liquibase) even when using JPA entities — schema-generation and migration tooling aren't actually mutually exclusive in practice. For this project, at this stage, the learning value of Way 1 wins.

## What an entity looks like now

```java
@Entity
@Table(name = "customers")
public class Customer {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    private String name;
}
```

Because of `ddl-auto=update`, Hibernate checks this against the real database at startup and adds whatever's missing — a new `customers` table, or a new column on an existing one. It never drops or renames a column on its own, so it's safe to run against a database that already has data in it, but it also means genuinely renaming a field means a leftover, unused old column stays behind unless someone cleans it up by hand (fine for a learning project; would need real migration tooling in production).

## Quick comparison

| | Let Hibernate generate (now) | Write the SQL yourself (before) |
|---|---|---|
| Who's really in charge of the tables | The `@Entity` classes | The `.sql` files |
| Easy to get exact column types/rules | Not always | Yes |
| Starter/seed data | Not supported directly | Just more SQL |
| Same everywhere (dev, CI, prod) | Not guaranteed | Guaranteed |
| Renamed/removed fields | Leaves the old column behind | Explicit, reviewed |
| Good for | Learning JPA/Hibernate hands-on | Anything meant for production |

---

## Background: how Hibernate and Flyway actually solve different problems

The rest of this doc is reference material — it explains *why* Way 2 is the industry-standard choice, even though this project runs Way 1. Read it to understand the tradeoff, not as a description of this project's current setup.

Hibernate/JPA maps Java objects to database tables and handles queries. Flyway manages database schema changes in a controlled, versioned way. In production, teams normally use **both**: Hibernate for ORM, Flyway for migrations.

### Hibernate's `ddl-auto` options

| Value | Behavior |
|---|---|
| `none` | Hibernate does not manage the schema |
| `validate` | Checks whether the schema matches the entities, changes nothing |
| `update` | Attempts to modify the schema automatically (this project's setting) |
| `create` | Deletes and recreates the schema on startup |
| `create-drop` | Creates on startup and deletes on shutdown |

`update` is convenient for prototypes, tutorials, and disposable databases — which is exactly why it fits this project's learning goal. It stops being a good idea once real data and multiple environments are involved, for the reasons below.

### Why `ddl-auto=update` gets risky at production scale

**No reliable migration history.** There's no record of what changed, when, or why. Flyway keeps that in a `flyway_schema_history` table, backed by ordered files like `V1__create_customers_table.sql`, `V2__add_customer_phone.sql`, etc. — an auditable trail `update` doesn't give you.

**Dangerous changes go unhandled.** Hibernate is good at adding simple columns, bad at anything destructive or ambiguous:

- Renaming `name` → `fullName` in the entity doesn't rename the column — Hibernate just adds a new `full_name` column and leaves `name` behind, orphaned with its old data.
- Changing a field's type (e.g. `String amount` → `BigDecimal amount`) may require cleaning invalid existing data first — something only a hand-written migration can express:

  ```sql
  UPDATE invoices SET amount = '0' WHERE amount IS NULL OR amount = '';
  ALTER TABLE invoices ALTER COLUMN amount TYPE NUMERIC(19, 2) USING amount::NUMERIC;
  ```

**Environments drift.** A dev database created three months ago, a fresh one created today, and a staging database with manual patches can all end up in different states under `update`, since each just reconciles from whatever code is currently checked out. Flyway's `V1 → V2 → V3` ordering makes every environment converge on the same schema regardless of history.

**Deployment control gets harder.** `update` runs at application startup — with multiple instances starting simultaneously, a slow or table-locking migration, or a failed deploy afterward, that's an uncontrolled moment for a production database. Flyway migrations can be reviewed and staged as an explicit step before the app starts.

**Hibernate only sees what's mapped as an entity.** Indexes, views, triggers, stored procedures, sequences, check constraints — things like:

  ```sql
  CREATE INDEX idx_invoices_customer_status ON invoices(customer_id, status);
  ALTER TABLE invoices ADD CONSTRAINT chk_invoice_amount_positive CHECK (total_amount >= 0);
  ```

  — aren't reliably managed by `ddl-auto` at all. Flyway can run any SQL the database supports.

### Why keep Hibernate at all, then

Flyway never replaces the ORM. Hibernate/Spring Data JPA still handles inserts, updates, deletes, relationships, queries, transactions, and dirty checking:

```java
public interface CustomerRepository extends JpaRepository<CustomerEntity, Long> {
    Optional<CustomerEntity> findByEmail(String email);
}
```

Flyway only owns the schema lifecycle; Hibernate owns the Java-to-database mapping. That's why the standard production pairing is:

```yaml
spring:
  jpa:
    hibernate:
      ddl-auto: validate
  flyway:
    enabled: true
```

Flyway creates and modifies the schema; Hibernate validates that the entities match it and fails fast on mismatch — instead of silently changing production.

### What that workflow looks like

1. **Entity:**
   ```java
   @Entity
   @Table(name = "customers")
   public class CustomerEntity {
       @Id @GeneratedValue(strategy = GenerationType.IDENTITY)
       private Long id;
       @Column(nullable = false) private String name;
       @Column(nullable = false, unique = true) private String email;
   }
   ```
2. **Migration** at `src/main/resources/db/migration/V1__create_customers_table.sql`:
   ```sql
   CREATE TABLE customers (
       id BIGSERIAL PRIMARY KEY,
       name VARCHAR(255) NOT NULL,
       email VARCHAR(255) NOT NULL,
       CONSTRAINT uk_customers_email UNIQUE (email)
   );
   ```
3. On startup, Flyway checks `flyway_schema_history`, finds unapplied migrations, runs them in order, records the result.
4. With `ddl-auto=validate`, Hibernate checks the resulting table has the columns it expects — and never modifies anything itself.

Adding a field means adding a migration alongside the entity change (`V2__add_customer_phone_number.sql`), so the project ends up with a readable, ordered changelog: `V1: create customers`, `V2: add phone number`, etc.

A staged rename (the case Hibernate `update` can't express safely) looks like:

```sql
-- V3__merge_customer_names.sql
ALTER TABLE customers ADD COLUMN full_name VARCHAR(511);
UPDATE customers SET full_name = CONCAT(first_name, ' ', last_name);
ALTER TABLE customers ALTER COLUMN full_name SET NOT NULL;
```

```sql
-- V4__remove_old_customer_name_columns.sql (after the app stops reading the old columns)
ALTER TABLE customers DROP COLUMN first_name;
ALTER TABLE customers DROP COLUMN last_name;
```

### Flyway's own costs (why it's not a free win either)

- **You write SQL for every change** — more upfront effort than editing an entity.
- **Requires real database knowledge** — constraints, indexes, locking, backward-compatible migrations.
- **Migration files are immutable once released.** Flyway checksums each applied file; editing `V5__add_invoice_status.sql` after it's run in any shared environment causes a validation error. Fixes go in a new file (`V6__fix_invoice_status_constraint.sql`), not an edit.

### Could you use Flyway without Hibernate?

Yes — Flyway only owns schema, not data access, so pairing it with plain JDBC, Spring's `JdbcClient`, jOOQ, or MyBatis instead of Hibernate is a valid choice for teams that prefer explicit SQL for reads/writes too. Flyway itself never executes application CRUD.

### General rule of thumb (not this project's current setting)

```yaml
ddl-auto: update      # learning, prototypes, disposable/local/test databases
```
```yaml
ddl-auto: validate     # + flyway.enabled: true — shared dev, QA, staging, production
```

A common per-environment split:

- **Local dev, if mirroring prod:** `validate` + Flyway enabled — local behaves exactly like production.
- **Local dev, early prototype:** `update`, Flyway disabled — what this project currently does.
- **Automated tests:** `create-drop`, Flyway disabled for disposable databases; or `validate` + Flyway enabled (pairs well with Testcontainers) when tests need to verify the real migrations.
- **Production:** always `validate` + Flyway enabled.

### Final comparison

| Concern | Hibernate ORM | Flyway |
|---|---|---|
| Map Java objects to tables | Yes | No |
| CRUD operations | Yes | No |
| Generate SQL queries | Yes | No |
| Manage relationships | Yes | No |
| Version schema changes | No | Yes |
| Keep migration history | No | Yes |
| Migrate existing data | Limited/unsafe | Yes |
| Create custom indexes or views | Limited | Yes |
| Safely control production changes | Not ideal | Yes |
| Validate entity/schema compatibility | Yes | No |

## Where this project stands today

Per the update note at the top: this project runs **Way 1** — `ddl-auto=update`, no Flyway — on purpose, because the goal right now is learning JPA/Hibernate mechanics directly through entity code. The Flyway + `validate` pairing described above is the path this project would move to if/when it prioritizes production-grade migration hygiene over hands-on ORM learning; it isn't a pending change, just the documented alternative.
