# Luna's Pet Central (Pet-Shelter-MVP)

Luna's Pet Central is an offline-first, single-user operations management tool designed for animal shelters. It replaces fragmented, paper-based processes with a unified digital solution covering pet registration and health tracking, pet lifecycle management, veterinary appointment coordination, and care scheduling.

## Domain Model & Architecture

- **Domain Glossary**: See [CONTEXT.md](./CONTEXT.md) for official ubiquitous language and avoided terms.
- **Product Requirements**: See [docs/product/](./docs/product/) for BRD, PRD, and RTM documents.
- **Phase 1 Technical Specification**: See [docs/architecture/SPEC-PHASE-1-OFFLINE-MVP.md](./docs/architecture/SPEC-PHASE-1-OFFLINE-MVP.md).

## Project Scope (Phase 1 — Offline MVP)

- **Operator & Shelter Management**: Local operator profile registration with offline access, multi-shelter management, and active shelter context switching.
- **Pet Management**: Pet profile registration (intake origin, estimated DOB, health conditions, status), photo/video media management, hard deletion, adoption availability toggle, and fast pet search/filtering.
- **Pet Lifecycle**: Outcome recording for In Foster (reversible), Adopted (with mandatory adopter details), Deceased, and Transferred (External), with automated archival side-effects.
- **Veterinary Coordination**: Shelter-scoped clinic and veterinarian directory, appointment logging with retroactive date warnings, and medical document attachments.
- **Care Events**: Modality and substance tracking, recurring scheduling (custom intervals), temporary medication courses, and local in-app due-date alerts.
- **Dashboard Overview**: Live per-shelter KPI metrics (active pets, in-treatment pets, foster pets, due care events).

## Issue Tracker

Project issues, roadmap, and specifications are tracked via GitHub issues at [helllllllder/Pet-Shelter-MVP](https://github.com/helllllllder/Pet-Shelter-MVP/issues).
