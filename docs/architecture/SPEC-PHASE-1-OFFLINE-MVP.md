# Technical Specification: Phase 1 (Offline MVP) Core

## Problem Statement

Animal shelter operators currently rely on fragmented, manual, and paper-based processes to manage pet intakes, medical histories, care schedules, and external veterinary visits. Paper records are vulnerable to loss or damage, care events and medication schedules are frequently missed or forgotten, and operators managing multiple shelters have no centralized, isolated digital tool to track operations locally without requiring complex cloud infrastructure or constant internet connectivity.

## Solution

Luna's Pet Central Phase 1 (Offline MVP) delivers a resilient, single-user, offline-first digital management application running locally on a single device. It empowers an operator to manage multiple local shelters in strict isolation, record full pet profiles and lifecycle outcomes, track veterinary clinic and professional contacts, log appointments with attached medical documents, schedule recurring and temporary care events with due-date alerts, and monitor operational health through a live per-shelter dashboard.

## User Stories

### Operator & Facility Management
1. As an operator, I want to create a local profile with my name and contact email on first launch, so that I can access the application without third-party login or internet connectivity.
2. As an operator, I want the application to automatically load my existing profile on return launches, so that I can immediately access shelter operations without authentication friction.
3. As an operator, I want to view and edit my profile details at any time, so that my contact information remains accurate.
4. As an operator, I want the system to reject profile creation and updates if required fields are missing or invalid, so that profile data integrity is maintained.
5. As an operator, I want to create new local shelters with a name and optional description, so that I can organize distinct physical facilities or operating units.
6. As an operator, I want newly created shelters to automatically become the active shelter context, so that I can immediately begin managing data for that shelter.
7. As an operator, I want the system to support multiple shelters with non-unique names, so that duplicate names across different locations do not block shelter creation.
8. As an operator, I want to edit shelter names and details at any time, so that facility changes are immediately reflected.
9. As an operator, I want to switch between shelters using a context selector, so that all views, lists, and operations are immediately scoped to the selected shelter.
10. As an operator, I want strict data isolation between shelters, so that records created in one shelter are never visible or accessible within another shelter.

### Pet Management & Demographics
11. As an operator, I want to register a new pet profile with name, date of birth, species, breed, sex, color, intake origin, health conditions, and health status, so that complete baseline records are established.
12. As an operator, I want to mark a pet's date of birth with an "Estimated" flag, so that approximate ages are clearly distinguished from verified birthdates across the UI.
13. As an operator, I want to select from standardized intake origins (Street Rescue, Owner Surrender, Transfer from Another Shelter, Born at Shelter) or provide free-text details for "Other", so that animal intake sources are accurately categorized.
14. As an operator, I want to record species-specific health condition flags (such as FIV/FeLV for felines) and current health status (Healthy, In Treatment, Recovering), so that medical readiness is visible at a glance.
15. As an operator, I want to view an active pet's full profile details, medical history, media, and scheduled care events in one central view, so that I can quickly assess the animal's condition.
16. As an operator, I want to edit any field of an existing pet profile, so that information can be corrected or updated as the animal develops.
17. As an operator, I want the system to allow duplicate pet names within a shelter, so that naming coincidences do not prevent intake registration.
18. As an operator, I want to permanently hard-delete a pet profile with an explicit confirmation dialog, so that accidental registrations can be completely removed.
19. As an operator, I want the system to prohibit hard deletion for archived pets, so that finalized historical records cannot be accidentally erased through standard operational views.
20. As an operator, I want to toggle an "Available for Adoption" flag on active pet profiles, so that adoptable animals are easily identified.
21. As an operator, I want to upload photos and videos to a pet's profile, so that visual identity and condition records are preserved.
22. As an operator, I want to delete individual media files from a pet's profile with confirmation, so that outdated or incorrect media can be pruned.
23. As an operator, I want to search pets by name with case-insensitive matching within the active shelter context, so that I can locate records in under 300 milliseconds.
24. As an operator, I want to filter the pet list by species, outcome status, and adoption availability, so that I can inspect specific cohorts of animals.

### Pet Lifecycle & Outcomes
25. As an operator, I want to place an active pet into "In Foster" status, so that temporary offsite foster placements are tracked while keeping the pet in active management.
26. As an operator, I want to clear the "In Foster" status when an animal returns to the shelter, so that the pet returns to normal active status without data loss.
27. As an operator, I want to record a pet outcome as "Adopted" by capturing mandatory adopter details (Name, Phone, Address), so that legal custody transfer is documented and the pet is safely archived.
28. As an operator, I want the system to block adoption completion if adopter details are incomplete, so that unverified adoptions cannot be finalized.
29. As an operator, I want to record a pet outcome as "Deceased", so that deceased animals are respectfully archived while preserving full historical records.
30. As an operator, I want to record a pet outcome as "Transferred (External)", so that relocations to partner shelters outside the platform are archived with complete historical integrity.
31. As an operator, I want the system to automatically cancel all pending and recurring care events upon pet archival, so that dead or departed animals do not generate operational alerts.
32. As an operator, I want the system to automatically disable and clear the "Available for Adoption" flag upon pet archival, so that archived pets cannot be marked as adoptable.

### Veterinary Directory & Appointments
33. As an operator, I want to register veterinary clinics with clinic name, address, and contact details in a shelter-scoped directory, so that partner facilities are easily referenced.
34. As an operator, I want to register veterinarians with name, specialization, and contact details linked to a specific clinic, so that consulting doctors are accurately cataloged.
35. As an operator, I want to search and filter the veterinary directory by clinic name, so that I can quickly select doctors and clinics during appointment booking.
36. As an operator, I want to edit veterinary clinic and veterinarian records, so that directory contact information remains current.
37. As an operator, I want to soft-delete veterinary clinics and veterinarians that are referenced by past appointments, so that historical appointments maintain referential integrity while hiding inactive entries from new searches.
38. As an operator, I want to permanently delete unreferenced directory entries, so that accidental entries can be cleanly removed.
39. As an operator, I want to log veterinary appointments for a pet by selecting a clinic and veterinarian, date/time, and clinical notes, so that medical visits are systematically recorded.
40. As an operator, I want a warning and confirmation dialog when logging or editing appointments with retroactive (past) dates, so that inadvertent date errors are caught while intentional retroactive logging is supported.
41. As an operator, I want to edit existing appointment records, so that visit notes or details can be updated after consultations.
42. As an operator, I want to upload medical documents (PDF, JPEG, PNG) directly to an appointment record, so that lab results, prescriptions, and medical discharge summaries are stored alongside the visit.
43. As an operator, I want the system to reject unsupported document file formats with clear error feedback, so that corrupt or unsupported files cannot be attached.

### Care Events & Treatment Scheduling
44. As an operator, I want to create care events for a pet by specifying modality (Vaccine, Vermifuge, Medication, Physical Therapy, Grooming), optional substance name, instructions, and due date, so that animal healthcare tasks are formalized.
45. As an operator, I want to configure recurring care events with custom intervals (hours, days, months, years), so that repeating treatments are automatically scheduled.
46. As an operator, I want to configure temporary care events with a fixed end date, so that acute medication courses automatically stop generating occurrences once completed.
47. As an operator, I want to edit individual or future occurrences of a recurring care event series without mutating historical completed records, so that schedule adjustments preserve past audit integrity.
48. As an operator, I want to delete a single care event occurrence or cancel an entire future series, so that discontinued treatments are cleanly stopped.
49. As an operator, I want to optionally link a care event to a veterinary appointment bidirectionally, so that clinical context is tied directly to administered treatments.
50. As an operator, I want to receive local in-app due-date alerts for scheduled care events, so that no animal misses a critical medication or vaccination.

### Dashboard & Operational Overview
51. As an operator, I want to view a real-time per-shelter dashboard with live KPI counters (Total Active Pets, Pets in Treatment, Pets in Foster, Due/Overdue Care Events), so that I can assess shelter operational state at a glance.
52. As an operator, I want dashboard metrics to recalculate instantly when switching shelter contexts or updating pet statuses, so that summary information is always authoritative and up to date.

## Implementation Decisions

### Modular Package Boundaries & Hexagonal Architecture
The application is structured into decoupled TypeScript packages following Hexagonal / Clean Architecture principles:
- **`@luna/domain`**: Pure, zero-dependency domain entities, value objects, domain invariants, and state machines (`PetLifecycleStateMachine`, `CareEventScheduler`). Completely platform-agnostic.
- **`@luna/contracts`**: Interface definitions (ports) for repositories (`IOperatorRepository`, `IShelterRepository`, `IPetRepository`, `IVetDirectoryRepository`, `IAppointmentRepository`, `ICareEventRepository`), file storage (`IMediaStorageService`), and notification dispatcher (`INotificationDispatcher`).
- **`@luna/schema`**: Zod validation schemas and Drizzle ORM table definitions representing the local schema.
- **`@luna/adapter-sqlite`**: Drizzle ORM persistence adapter backed by SQLite with UUIDv7 primary keys, foreign key constraints, and multi-tenant scoping.
- **`@luna/app-core`**: Application services and use case orchestrators exposing a unified facade (`ShelterAppFacade`) representing the primary operational seam.
- **`@luna/ui-mobile`**: React Native (Expo) presentation layer using Zustand for state slices and React Navigation for screen flows.

### Local Persistence & Multi-Tenant Data Scoping
- All persistent data resides in a local SQLite database on the client device.
- Every domain entity (except Operator) includes a mandatory `shelter_id` foreign key.
- Repositories are parameterized by `ShelterContext` or built via a `ScopedRepositoryFactory`, enforcing strict shelter isolation on all `SELECT`, `INSERT`, `UPDATE`, and `DELETE` queries.
- Primary keys utilize time-sortable UUIDv7 strings to ensure uniqueness without coordinating with a central server, simplifying future data synchronization.

### State Machines & Lifecycle Rules

#### Pet Lifecycle State Machine
```
   [Active] <===============> [In Foster]
      │
      ├──> [Adopted] (Archived: Requires Adopter Details)
      ├──> [Deceased] (Archived: Triggers Care Event Auto-Cancel)
      └──> [Transferred (External)] (Archived: Triggers Care Event Auto-Cancel)
```
- Active pets can move between `Active` and `In Foster` losslessly.
- Setting outcome to `Adopted`, `Deceased`, or `Transferred (External)` transitions the record to an archived state.
- Transitioning to any archived state triggers side-effects: clears `available_for_adoption` to `false` and cancels all pending/future care events.
- Hard delete is permitted only for non-archived profiles via an explicit confirmation dialog.

#### Care Event Recurrence & In-App Alerts
- Care events store a recurrence rule (interval and unit: hours, days, months, years) or a temporary course end date.
- Occurrences are generated deterministically based on interval rules.
- Local in-app notifications query pending occurrences where `due_date <= NOW()` scoped to the active `shelter_id`.

### Media & Document Storage
- Uploaded pet photos/videos and veterinary documents (PDF, JPEG, PNG) are stored in the application's sandboxed local filesystem directory.
- Database records store relative file paths and metadata (file size, MIME type, upload timestamp).
- Media deletions delete the underlying local file and the corresponding database reference.

## Testing Decisions

### High-Seam Testing Architecture
- All tests are written against the highest possible architectural seam: **`ShelterAppFacade`** (Application Service Layer).
- Tests drive real workflows using user-facing intent (e.g., `registerPet`, `recordCareEvent`, `logAppointment`, `transitionPetOutcome`, `getDashboardOverview`) rather than asserting on private internal state or mock function calls.
- Tests run against an actual in-memory SQLite database instance with all Drizzle migrations applied, ensuring 100% realistic query execution, constraint validation, and transactional behavior.

### Tested Capabilities
- **Operator & Shelter Lifecycle**: Profile creation, corrupted profile fallback, duplicate shelter handling, and context switching.
- **Data Isolation**: Verifying that queries in Shelter A never leak records created in Shelter B.
- **Pet Management & Archival**: Profile validation, estimated DOB persistence, outcome transitions, mandatory adopter details validation, and archival side-effects (canceling care events, clearing adoption flags).
- **Veterinary & Appointments**: Soft-delete semantics on referenced clinics/vets, appointment logging with retroactive date flags, and document attachment constraints.
- **Care Events Recurrence**: Occurrence generation, temporary course completion, occurrence edits without corrupting past occurrences, and due-date alert triggers.
- **Dashboard KPIs**: Live recalculation of active counts, treatment counts, foster counts, and due care events.

## Out of Scope

The following capabilities belong to subsequent phases and are strictly out of scope for this Phase 1 (Offline MVP) specification:
- **Phase 2 (v1.1 Operational Enrichment)**: Local shelter deletion/close, single/all shelter data export (JSON/ZIP), categorized inventory tracking, inventory threshold alerts, 1-click care event inventory decrements, maintenance task scheduling and assignment, two-tier notifications (email/push) with retry/escalation.
- **Phase 3 (v1.2 Online Foundation)**: Cloud synchronization, Google SSO authentication, multi-user role-based access control (Admin, Staff, Read-only), staff invite links, shareable adoption and veterinary profile links with TTL and revocation.
- **Phase 4 (v1.3 Reporting & Discovery)**: Proactive care event reminders (7, 3, 1 day prior), secondary search across inventory and maintenance, advanced census, historical, and staff headcount reporting.
- **Future (v2.0+)**: Internal multi-shelter transfer shadow records, appointment soft deletion with placeholder text.

## Further Notes

- All requirement IDs mapped in this specification correspond directly to [`docs/product/PRD.md`](file:///home/helders-lab/Documents/prototypes/Pet-Shelter-MVP/docs/product/PRD.md) and [`docs/product/RTM.md`](file:///home/helders-lab/Documents/prototypes/Pet-Shelter-MVP/docs/product/RTM.md).
- Terminology used throughout strictly conforms to [`CONTEXT.md`](file:///home/helders-lab/Documents/prototypes/Pet-Shelter-MVP/CONTEXT.md).
