# ADR-0001: Cross-Platform Framework Selection — React Native (Expo) + TypeScript

| Attribute | Value |
| :--- | :--- |
| **Status** | Accepted |
| **Date** | 2026-08-28 |
| **Deciders** | Principal Mobile Architect, Technical Lead |
| **Consulted** | Project Sponsor, Engineering Team |
| **Informed** | SDLC Agents, Full Development Team |

---

## Context

Luna's Pet Central begins in Phase 1 (MVP v1.0) as a single-device mobile application (iOS and Android) but is slated on the product roadmap to expand in Phase 2/3 to a desktop and web platform. The business requires high developer velocity, zero language bifurcation, and near-total reuse of domain models, validation logic, and state management across mobile and web platforms.

## Decision

Adopt **React Native with Expo (Managed Workflow, Prebuild-ready) and TypeScript**.

The application domain layer, Zod validation schemas, repository contracts, and state stores will be authored in 100% platform-agnostic TypeScript packages (`@luna/domain`, `@luna/schema`, `@luna/contracts`, `@luna/state`), with platform-specific presentation bindings provided by React Native on mobile and React DOM on web.

## Alternatives Considered

1. **Flutter (Dart)**:
   - *Pros*: High rendering performance, uniform cross-platform UI.
   - *Cons / Why Rejected*: Dart cannot share domain schemas (e.g. Zod), validation rules, or TypeScript models directly with web and backend tooling without duplicate codebases or code-generation overhead.
2. **Native iOS (Swift) & Android (Kotlin)**:
   - *Pros*: Maximum native performance and platform capabilities.
   - *Cons / Why Rejected*: Separate native codebases triple development and maintenance costs for an offline MVP and provide zero code sharing with future web interfaces.
3. **Progressive Web App (PWA) in Capacitor / Cordova**:
   - *Pros*: Fast web-to-mobile wrapper.
   - *Cons / Why Rejected*: Raw PWA storage on mobile operating systems (iOS Safari WKWebView IndexedDB) suffers from aggressive 7-day storage eviction policies under OS memory pressure, violating data retention and offline reliability requirements (NFR08, NFR15).

## Consequences & Trade-offs

- **Positive Consequences**:
  - 100% shared TypeScript domain logic and schemas across mobile and future web apps.
  - Expo Router provides file-based universal navigation patterns.
  - Direct access to high-performance synchronous and asynchronous native SQLite bindings.
  - Rapid local development and testing iterations via Expo Go and development builds.
- **Negative Consequences / Trade-offs**:
  - Slightly larger initial binary size than pure native single-platform apps (~25MB).
  - Native module bridges require deliberate lifecycle management for specialized file system interactions.\n