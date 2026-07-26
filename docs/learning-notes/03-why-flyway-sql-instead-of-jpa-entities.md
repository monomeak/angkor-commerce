---
tags: [spring-boot, jpa, hibernate, backend, acme-invoice, learning-notes]
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
