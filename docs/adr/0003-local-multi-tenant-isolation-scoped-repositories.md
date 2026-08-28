# ADR-0003: Local Multi-Tenant Isolation Strategy — Unified SQLite Database with Scoped Repository Interceptors

| Attribute | Value |
| :--- | :--- |
| **Status** | Accepted |
| **Date** | 2026-08-28 |
| **Deciders** | Principal Security & Data Architect |
| **Consulted** | Technical Lead, Principal Database Architect |
| **Informed** | SDLC Agents, Full Development Team |

---

## Context

In Phase 1, a single operator can create and manage multiple shelter profiles on one device (FR02, FR04, NFR08). Data between shelters must never cross-contaminate in UI views or queries. Furthermore, internal transfers (FR10) create shadow records that span shelter boundaries, and the operator must be able to export either a single shelter or all shelters in a single operation (FR03).

## Decision

Implement a **Unified Local SQLite Database** utilizing the **Scoped Repository Interceptor Pattern with Composite Foreign Keys**.

Every query is constructed through a scoped session object that automatically injects `WHERE shelter_id = :active_shelter_id` and binds `shelter_id` on all insertions. Multi-tenant isolation is enforced at the repository contract level rather than relying on ad-hoc filtering in UI components.

## Alternatives Considered

1. **Physical Database-per-Shelter (`shelter_<uuid>.db`)**:
   - *Pros*: Absolute physical file-level boundary between shelters.
   - *Cons / Why Rejected*:
     - Cross-shelter operations (such as FR10 internal transfer shadow record creation) cannot execute inside an atomic ACID transaction across separate database files without complex `ATTACH DATABASE` locks.
     - Generating an "Export All Shelters" bundle (FR03) requires orchestrating multiple SQLite connection handles and merging disparate schema versions.
     - Managing connection pools and migration lifecycles across dynamic file counts introduces significant mobile OS file handle overhead.
2. **Client-Side Ad-Hoc Filtering**:
   - *Pros*: Simple to start without repository infrastructure.
   - *Cons / Why Rejected*: Developers manually appending `where(eq(pets.shelterId, activeId))` in every UI query is prone to human omission, inevitably leading to data leakage and violating NFR08.

## Consequences & Trade-offs

- **Positive Consequences**:
  - Single unified migration pipeline for the entire application.
  - Atomic cross-shelter transfer transactions for internal transfers (FR10).
  - Unified data export engine for both single-shelter and all-shelter exports (FR03).
  - Scoped repository factory prevents cross-tenant leaks by construction.
- **Negative Consequences / Trade-offs**:
  - Requires defense-in-depth safeguards (composite foreign keys and repository-level context assertions) to guarantee isolation.\n