---
tags: [spring-boot, jpa, hibernate, backend, angkor-commerce, learning-notes]
date: 2026-07-24
updated: 2026-07-26
---

# JPA entities and relationships, simply

An "entity" is just a Java class that represents one row in a database table. This note shows what those classes look like for this project, and how relationships between tables (like "an invoice belongs to a customer") get written in Java.

> **Update (2026-07-26):** the project now generates its schema from these entities instead of hand-written SQL — see [[03-why-flyway-sql-instead-of-jpa-entities]]. `Customer` (`apps/core-api/src/main/java/com/angkor/commerce/customer/Customer.java`) is the first one actually built, with a repository and a read-only `/api/customers` endpoint. The rest below (`Invoice`, `Payment`, `User`/`Role`) are still just the plan — built feature by feature as each DummyJSON feature gets replaced.

## The basics

```java
@Entity
@Table(name = "customers")
public class Customer {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String name;
    private String email;
}
```

- `@Entity` — "this class is linked to a database table."
- `@Table(name = "customers")` — which table exactly.
- `@Id` — this field is the primary key.
- `@GeneratedValue(strategy = GenerationType.IDENTITY)` — let the database pick the ID number automatically (matches how the `customers` table was already set up).

That's genuinely most of what you need for a simple entity with no relationships.

## Relationships — how tables connect in Java

This project's schema already has 5 relationships. Here's each one, plain and simple.

### "Many invoices belong to one customer"

```java
// inside Invoice.java
@ManyToOne
@JoinColumn(name = "customer_id")
private Customer customer;
```

`@ManyToOne` means "many of these (invoices) point to one of those (a customer)." `@JoinColumn` says which column holds that link — matches the `customer_id` column that's already in the `invoices` table.

Same pattern, three more times:

```java
// InvoiceItem.java — an item belongs to one invoice, and one product
@ManyToOne @JoinColumn(name = "invoice_id") private Invoice invoice;
@ManyToOne @JoinColumn(name = "product_id") private Product product;

// Payment.java — a payment belongs to one invoice
@ManyToOne @JoinColumn(name = "invoice_id") private Invoice invoice;
```

### "Users can have many roles, and roles can belong to many users"

This one's different — it's a **many-to-many**, so it needs a middle table (`user_roles`) to connect them both ways:

```java
@Entity
public class User {
    @Id @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToMany
    @JoinTable(
        name = "user_roles",
        joinColumns = @JoinColumn(name = "user_id"),
        inverseJoinColumns = @JoinColumn(name = "role_id")
    )
    private Set<Role> roles;
}
```

`@JoinTable` says "here's the middle table, and here are its two columns." Hibernate creates this table automatically the first time a `User` entity with a `@ManyToMany` gets registered — no SQL to write by hand.

## What Hibernate actually generates from these annotations

A column for each `@ManyToOne` (plus a foreign key constraint), and a middle table for each `@ManyToMany`. What it *won't* pick well on its own without extra annotations: exact numeric precision for money columns (use `@Column(precision = 19, scale = 4)` on `BigDecimal` fields), or starter/seed data — that still needs either a small `CommandLineRunner`/`@PostConstruct` bean, or `data.sql`, run once at startup.

## How mistakes get caught now

With `spring.jpa.hibernate.ddl-auto=update`, Hibernate compares each entity to the real database at every startup and **adds** whatever's missing — a new table, a new column. It never drops or renames anything on its own, so it's safe to run against a database that already has real data. The trade-off: it also won't warn you about a genuinely renamed field — you get a new column sitting alongside the old, now-unused one, and cleaning that up is a manual step. See [[03-why-flyway-sql-instead-of-jpa-entities]] for the full comparison against the `ddl-auto=validate` + Flyway approach this project started with.
