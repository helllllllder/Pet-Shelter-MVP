# ADR-0002: Storage Engine & Query Layer — Native SQLite with Drizzle ORM

| Attribute | Value |
| :--- | :--- |
| **Status** | Accepted |
| **Date** | 2026-08-28 |
| **Deciders** | Principal Database Architect, Systems Lead |
| **Consulted** | Technical Lead, Mobile Architect |
| **Informed** | SDLC Agents, Full Development Team |

---

## Context

The Phase 1 storage layer must deliver sub-300ms query performance (NFR02), support relational joins across core entities (pets, care events, appointments, documents), enforce strict schema integrity locally, and translate 1:1 to a future cloud-hosted PostgreSQL schema (Phase 3) without requiring schema re-engineering.

## Decision

Adopt **Native SQLite (`expo-sqlite` / `op-sqlite`)** managed through **Drizzle ORM** (TypeScript-first SQL query builder and schema definition tool).

All database entities will be defined using Drizzle's relational schema definition DSL, providing compile-time type safety for TypeScript queries and automated SQLite migration generation.

## Alternatives Considered

1. **WatermelonDB (SQLite-backed RxDB)**:
   - *Pros*: Highly optimized for React Native lazy loading and observable query models.
   - *Cons / Why Rejected*: Introduces an opinionated, proprietary sync engine and column convention that diverges from standard PostgreSQL DDL, increasing migration friction and schema translation complexity for Phase 3 cloud integration.
2. **Realm / MongoDB Embedded**:
   - *Pros*: Object-oriented embedded database with reactive data models.
   - *Cons / Why Rejected*: Uses a proprietary binary database format that cannot be queried with standard SQL tools and complicates flat JSON data export (FR03) and future cloud PostgreSQL ingestion.
3. **Pure Raw SQLite Strings**:
   - *Pros*: Zero external dependencies beyond the SQLite driver.
   - *Cons / Why Rejected*: Raw SQL strings lack compile-time type safety, leading to silent schema refactoring bugs and error-prone migration scripts.

## Consequences & Trade-offs

- **Positive Consequences**:
  - Complete compile-time type safety with TypeScript for all database queries and mutations.
  - Drizzle schemas write to SQLite locally but generate equivalent PostgreSQL DDL with minor dialect mapping.
  - Zero runtime reflection overhead; compiled SQL queries execute with native SQLite performance.
  - Native support for SQLite B-tree indexes, foreign key cascades, and ACID transactions.
- **Negative Consequences / Trade-offs**:
  - Developers write relational SQL migrations rather than schema-less document updates.
  - Requires compile-time migration bundle management inside the React Native asset bundle.\n