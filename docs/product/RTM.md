# Requirements Traceability Matrix: Luna's Pet Central

**Version**: 3.4
**Date**: 2026-08-30
**Source Documents**: BRD v3.3, PRD v3.3

---

## Document Tracking

| Version | Edits Completed By | Date | Description of Edit |
| :--- | :--- | :--- | :--- |
| 2.0 | Antigravity AI Architect | 2026-08-28 | Initial traceability matrix created from BRD v3.0 and PRD v3.0 |
| 3.1 | Antigravity AI Architect | 2026-08-30 | Updated to reflect atomic requirement refinement — all FR IDs split into sub-IDs (FR01-A through FR36), NFR16 split into NFR16-A/NFR16-B. FR count synced from 40 to 52. All 7 mapping sections updated. |
| 3.2 | Antigravity AI Architect | 2026-08-30 | Gap review and fix — added 5 missing edge cases (FR06, FR17, FR22-B, FR23-B, FR24), added 3 missing past-date edge cases (FR15-A, FR19-A, FR22-A), added 20 explicit "No state machine" entries for utility/reference FRs, added FR25-B to Process Flow and KPI sections, added 3 test cases for new edge cases. All 7 sections now contain all 73 atomic FRs. |
| 3.3 | Antigravity AI Architect | 2026-08-30 | Gap review and reconciliation — added 11 new CRUD FRs (FR07-B, FR11-D–G, FR12-C, FR15-D–E, FR19-C, FR22-C–D) across all 7 sections; fixed duplicate FR24 state machine entry; added missing 'No state machine' entries for FR01-A/B/C, FR02-A/B, FR04, FR06, FR07; corrected FR count; fixed NFR16-A mapping rationale for FR08-A/B. |
| 3.4 | Antigravity AI Architect | 2026-08-30 | Aligned Phase 1 (MVP) scope with MVP.md: promoted Pet Search & Filter (FR30-A) and Per-shelter Dashboard Overview (FR31) to Phase 1 (MVP); moved Local Shelter Deletion/Close (FR02-C) and Data Export (FR03-A/B) to Phase 2 (Operational Enrichment); updated Section 1 backup rationale for FR03-A. |

---

## 1. FR → NFR Mapping

This table maps each Functional Requirement to the Non-Functional Requirements that constrain or govern it.

| FR ID | FR Name | Related NFRs | Rationale |
| :--- | :--- | :--- | :--- |
| FR01-A | Local operator profile creation | NFR01 (Usability), NFR08 (Data Isolation) | Local profile must be simple to complete (usability). Profile data is stored locally and scoped to the device (data isolation at device level). |
| FR01-B | Returning operator auto-access | NFR01 (Usability) | Auto-access must be immediate with no login friction (usability). |
| FR01-C | Local operator profile edit | NFR01 (Usability), NFR13 (Audit Logging) | Profile edits must be straightforward (usability). Edit events are audited. |
| FR02-A | Local shelter creation | NFR01 (Usability), NFR08 (Data Isolation) | Shelter creation must be straightforward (usability). Each shelter is an independent data container with enforced isolation (data isolation). |
| FR02-B | Local shelter edit | NFR01 (Usability) | Shelter edits must be straightforward (usability). |
| FR02-C | Local shelter deletion/close | NFR01 (Usability), NFR08 (Data Isolation) | Closure requires all pets resolved (data isolation enforcement). Process must be clear and safe (usability). |
| FR03-A | Local data export for a single shelter | NFR01 (Usability), NFR15 (Backup & DR) | Export must be easy to initiate (usability). Export serves as the Phase 2 backup mechanism (backup & DR). |
| FR03-B | Local data export for all shelters | NFR01 (Usability), NFR15 (Backup & DR) | All-shelter export must be easy to initiate (usability). Serves as comprehensive backup. |
| FR04 | Single-user shelter context switching | NFR01 (Usability), NFR02 (Performance), NFR08 (Data Isolation) | Context switching must be fast and intuitive (usability, performance). Switching enforces data isolation between shelters. |
| FR05-A | Pet profile creation | NFR01 (Usability), NFR02 (Performance), NFR07 (Access Control), NFR08 (Data Isolation), NFR09 (Medical Privacy), NFR13 (Audit Logging), NFR17 (Global Search) | Pet registration must be completable in < 5 clicks (usability). Profile pages must load in < 2s (performance). Health data is private (medical privacy). Records are shelter-scoped (data isolation), access-controlled, and searchable via global search. Creation is audited. |
| FR05-B | Pet profile edit | NFR01 (Usability), NFR07 (Access Control), NFR13 (Audit Logging) | Edits must be straightforward (usability). Restricted to Staff+ (access control). Changes are audited. |
| FR05-C | Pet profile hard deletion | NFR07 (Access Control), NFR13 (Audit Logging) | Hard delete is restricted to Staff+ (access control). Deletion events are audited. Requires explicit confirmation (usability). |
| FR06 | Adoption availability flag toggle | NFR01 (Usability), NFR07 (Access Control), NFR13 (Audit Logging) | Toggle must be simple (usability), restricted to Staff+ (access control), and logged (audit). |
| FR07 | Pet media upload (photos/videos) | NFR02 (Performance), NFR07 (Access Control), NFR09 (Medical Privacy), NFR11 (Asset Protection), NFR13 (Audit Logging) | Media must load performantly. Uploads are restricted to Staff+. Media is included in shareable links but must not be guessable via public URLs (asset protection). Uploads are audited. |
| FR07-B | Pet media deletion | NFR07 (Access Control), NFR09 (Medical Privacy), NFR11 (Asset Protection), NFR13 (Audit Logging) | Media deletion is restricted to Staff+ (access control). Deleted media may have been in shareable links (privacy). Assets must be properly cleaned up (asset protection). Deletions are audited. |
| FR08-A | Set outcome to Deceased | NFR01 (Usability), NFR07 (Access Control), NFR08 (Data Isolation), NFR13 (Audit Logging), NFR16-A (Data Deletion Workflow) | Outcome transition must be straightforward (usability). Only Staff+ can set outcomes (access control). Archived pet records may be subject to GDPR deletion requests via NFR16-A workflow. Outcome change is a significant audit event. |
| FR08-B | Set outcome to Transferred (External) | NFR07 (Access Control), NFR08 (Data Isolation), NFR13 (Audit Logging), NFR16-A (Data Deletion Workflow) | External transfer archives at originating shelter. Only Staff+ can set outcomes (access control). Archived pet records may be subject to GDPR deletion requests via NFR16-A workflow. |
| FR08-C | Set outcome to In Foster | NFR01 (Usability), NFR07 (Access Control) | Status toggle must be straightforward (usability). Restricted to Staff+ (access control). Reversible — no archival side-effects. |
| FR08-D | Pet archival side-effects | NFR08 (Data Isolation), NFR13 (Audit Logging) | Side-effects enforce data isolation boundaries (care event cancellation scoped to shelter). Auto-revocation of links is audited. |
| FR09 | Adopter details capture on adoption | NFR07 (Access Control), NFR09 (Medical Privacy), NFR13 (Audit Logging), NFR16-A (Data Deletion Workflow) | Adopter details contain PII — accessible only to authenticated staff (privacy), gated by role (access control), subject to GDPR deletion workflow (NFR16-A), and audited. |
| FR10-A | Shadow record creation for internal transfers | NFR07 (Access Control), NFR08 (Data Isolation), NFR09 (Medical Privacy), NFR13 (Audit Logging), NFR15 (Backup & DR) | Shadow records span shelter boundaries, requiring careful data isolation enforcement. Medical history is transferred (privacy concern). Transfer events are audited. Record integrity must survive disasters (backup). |
| FR10-B | Migration of active treatments and care events on internal transfer | NFR08 (Data Isolation), NFR09 (Medical Privacy), NFR13 (Audit Logging) | Treatment migration preserves care continuity across shelter boundaries (data isolation). Medical data is transferred securely (privacy). Migration events are audited. |
| FR11-A | Veterinary directory search and filtering | NFR01 (Usability), NFR02 (Performance), NFR07 (Access Control), NFR08 (Data Isolation), NFR17 (Global Search) | Directory must be fast and searchable (performance, global search). Entries are shelter-scoped (data isolation). Only Staff+ can search/add entries (access control). Must be easy to use (usability). |
| FR11-B | Add veterinary clinic to directory | NFR01 (Usability), NFR07 (Access Control), NFR08 (Data Isolation), NFR13 (Audit Logging) | Adding clinics must be straightforward (usability). Restricted to Staff+ (access control). Entries are shelter-scoped (data isolation). Creation is audited. |
| FR11-C | Add veterinarian to directory | NFR01 (Usability), NFR07 (Access Control), NFR08 (Data Isolation), NFR13 (Audit Logging) | Adding vets must be straightforward (usability). Restricted to Staff+ (access control). Vets are shelter-scoped and linked to clinics (data isolation). Creation is audited. |
| FR11-D | Edit veterinary clinic in directory | NFR01 (Usability), NFR07 (Access Control), NFR08 (Data Isolation), NFR13 (Audit Logging) | Edits must be straightforward (usability). Restricted to Staff+ (access control). Entries are shelter-scoped (data isolation). Changes are audited. |
| FR11-E | Soft-delete veterinary clinic from directory | NFR07 (Access Control), NFR08 (Data Isolation), NFR13 (Audit Logging) | Soft-delete preserves referential integrity with existing appointments. Restricted to Staff+ (access control). Shelter-scoped (data isolation). Deletions are audited. |
| FR11-F | Edit veterinarian in directory | NFR01 (Usability), NFR07 (Access Control), NFR08 (Data Isolation), NFR13 (Audit Logging) | Edits must be straightforward (usability). Restricted to Staff+ (access control). Shelter-scoped (data isolation). Changes are audited. |
| FR11-G | Soft-delete veterinarian from directory | NFR07 (Access Control), NFR08 (Data Isolation), NFR13 (Audit Logging) | Soft-delete preserves referential integrity. Restricted to Staff+ (access control). Shelter-scoped (data isolation). Deletions are audited. |
| FR12-A | Veterinary appointment logging | NFR01 (Usability), NFR02 (Performance), NFR07 (Access Control), NFR09 (Medical Privacy), NFR13 (Audit Logging) | Appointments are medical records (privacy), must be logged efficiently (usability, performance), restricted to Staff+ (access control), and audited. |
| FR12-B | Retroactive appointment date warning | NFR01 (Usability), NFR07 (Access Control) | Warning dialog must be clear and intuitive (usability). Restricted to Staff+ (access control). |
| FR12-C | Edit veterinary appointment | NFR01 (Usability), NFR02 (Performance), NFR07 (Access Control), NFR09 (Medical Privacy), NFR13 (Audit Logging) | Appointments are medical records (privacy). Edits must be logged efficiently (usability, performance). Restricted to Staff+ (access control). Changes are audited. |
| FR13-A | Veterinary document upload | NFR02 (Performance), NFR07 (Access Control), NFR09 (Medical Privacy), NFR11 (Asset Protection), NFR13 (Audit Logging), NFR15 (Backup & DR) | Documents contain sensitive medical data (privacy). Must not be accessible via guessable URLs (asset protection). Uploads must be performant and backed up. Document uploads are audited. |
| FR13-B | Unsupported file type rejection | NFR01 (Usability), NFR07 (Access Control) | Rejection messages must be clear and descriptive (usability). Validation is enforced at the access control layer. |
| FR14 | Appointment soft delete with reference preservation | NFR07 (Access Control), NFR09 (Medical Privacy), NFR13 (Audit Logging), NFR16-A (Data Deletion Workflow) | Soft-deleted records are retained per data retention workflow (NFR16-A). Deletion is restricted to Staff+ (access control). Medical data remains in the data store for referential integrity (privacy). Deletions are audited. |
| FR15-A | Care event creation | NFR01 (Usability), NFR02 (Performance), NFR07 (Access Control), NFR09 (Medical Privacy), NFR13 (Audit Logging) | Care events are medical records (privacy), must be completable in < 5 clicks (usability), load quickly (performance), restricted to Staff+ (access control), and audited. |
| FR15-B | Recurring care event scheduling | NFR01 (Usability), NFR07 (Access Control), NFR13 (Audit Logging) | Scheduling must be straightforward (usability). Restricted to Staff+ (access control). Schedule changes are audited. |
| FR15-C | Temporary care event with end date | NFR01 (Usability), NFR07 (Access Control), NFR13 (Audit Logging) | End date configuration must be intuitive (usability). Restricted to Staff+ (access control). Events are audited. |
| FR15-D | Edit care event | NFR01 (Usability), NFR07 (Access Control), NFR09 (Medical Privacy), NFR13 (Audit Logging) | Care events are medical records (privacy). Edits must be straightforward (usability). Restricted to Staff+ (access control). Changes are audited. |
| FR15-E | Delete care event | NFR07 (Access Control), NFR09 (Medical Privacy), NFR13 (Audit Logging) | Deletion of medical records requires role enforcement (access control, privacy). Deletions are audited. |
| FR16 | Care event and appointment optional linking | NFR07 (Access Control), NFR09 (Medical Privacy), NFR13 (Audit Logging) | Linking connects medical records (privacy). Restricted to Staff+ (access control). Link creation/modification is audited. |
| FR17 | Care event due-date in-app notification | NFR05 (In-app Notification Reliability), NFR07 (Access Control), NFR14 (Notification Privacy) | Notifications must be delivered within 5 seconds (reliability). Only shelter staff receive them (access control). If escalated to email, must not contain sensitive medical data (notification privacy). |
| FR18 | Proactive care event reminders (7, 3, 1 day before) | NFR05 (In-app Notification Reliability), NFR07 (Access Control), NFR14 (Notification Privacy) | Proactive reminders must be delivered within 5 seconds (reliability). Scoped to shelter staff (access control). External delivery must not include medical details (notification privacy). |
| FR19-A | Inventory item creation | NFR01 (Usability), NFR02 (Performance), NFR07 (Access Control), NFR08 (Data Isolation), NFR13 (Audit Logging), NFR17 (Global Search) | Inventory is shelter-scoped (data isolation). Must be easy to manage (usability), load quickly (performance), restricted to Staff+ for edits (access control), searchable (global search), and adjustments are audited. |
| FR19-B | Inventory quantity adjustment | NFR01 (Usability), NFR07 (Access Control), NFR13 (Audit Logging) | Adjustments must be straightforward (usability). Restricted to Staff+ (access control). Changes are audited. Negative quantities prevented (usability). |
| FR19-C | Delete inventory item | NFR07 (Access Control), NFR08 (Data Isolation), NFR13 (Audit Logging) | Item deletion is restricted to Staff+ (access control). Shelter-scoped (data isolation). Deletions are audited with item name preserved in historical log entries. |
| FR20-A | Quantity threshold alert rule | NFR05 (In-app Notification Reliability), NFR07 (Access Control), NFR13 (Audit Logging), NFR14 (Notification Privacy) | Alerts must fire reliably within 5 seconds in-app (reliability). Configuration is restricted to Staff+ (access control). Alert events are audited. External notifications must not contain sensitive data (notification privacy). |
| FR20-B | Expiration window alert rule | NFR05 (In-app Notification Reliability), NFR07 (Access Control), NFR13 (Audit Logging), NFR14 (Notification Privacy) | Alerts must fire reliably within 5 seconds in-app (reliability). Configuration is restricted to Staff+ (access control). Alert events are audited. External notifications must not contain sensitive data (notification privacy). |
| FR21-A | Inventory usage template decrement from care events | NFR01 (Usability), NFR02 (Performance), NFR07 (Access Control), NFR13 (Audit Logging) | 1-click decrement is a usability optimization. Must be fast (performance). Restricted to Staff+ (access control). Decrements are fully tracked in the audit log. |
| FR21-B | Insufficient stock handling on template decrement | NFR01 (Usability), NFR07 (Access Control) | Warning must be clear and prevent accidental over-decrement (usability). Restricted to Staff+ (access control). Care event is saved without inventory link. |
| FR21-C | Inventory adjustment reversal with audit tracking | NFR07 (Access Control), NFR13 (Audit Logging) | Reversals are restricted to Staff+ (access control). All adjustments including reversals are fully tracked in the audit log. |
| FR22-A | Single maintenance task creation | NFR01 (Usability), NFR02 (Performance), NFR07 (Access Control), NFR08 (Data Isolation), NFR13 (Audit Logging), NFR17 (Global Search) | Tasks must be easy to create (usability), load quickly (performance), shelter-scoped (data isolation), restricted to Staff+ (access control), searchable (global search), and audited. |
| FR22-B | Recurring maintenance task creation | NFR01 (Usability), NFR07 (Access Control), NFR13 (Audit Logging) | Recurrence configuration must be straightforward (usability). Restricted to Staff+ (access control). Creation is audited. |
| FR22-C | Edit maintenance task | NFR01 (Usability), NFR07 (Access Control), NFR08 (Data Isolation), NFR13 (Audit Logging) | Edits must be straightforward (usability). Restricted to Staff+ (access control). Shelter-scoped (data isolation). Changes are audited. |
| FR22-D | Delete/cancel maintenance task | NFR07 (Access Control), NFR08 (Data Isolation), NFR13 (Audit Logging) | Deletion is restricted to Staff+ (access control). Shelter-scoped (data isolation). Deletions are audited. Cancelled tasks remain for reporting. |
| FR23-A | Maintenance task notifications | NFR05 (In-app Notification Reliability), NFR06 (Email/Push Reliability), NFR07 (Access Control), NFR13 (Audit Logging), NFR14 (Notification Privacy) | Task notifications must be delivered within 5 seconds in-app (NFR05) and 60 seconds for email/push (NFR06). Completion logging is audited. External notifications must not contain sensitive data (notification privacy). |
| FR23-B | Maintenance task completion tracking | NFR07 (Access Control), NFR13 (Audit Logging) | Completion logging is restricted to Staff+ (access control). Completion events are audited with timestamp and attribution. |
| FR24 | Two-tier notification delivery (Standard in-app + Custom email/push) | NFR05 (In-app Notification Reliability), NFR06 (Email/Push Reliability), NFR07 (Access Control), NFR14 (Notification Privacy) | In-app must deliver within 5 seconds (NFR05); email/push within 60 seconds (NFR06). Configuration is per-user/per-event (access control). External notifications must not contain medical data (notification privacy). |
| FR25-A | Notification delivery status tracking and retry | NFR05 (In-app Notification Reliability), NFR06 (Email/Push Reliability), NFR13 (Audit Logging) | Failure escalation depends on reliable in-app delivery for the banner (NFR05). Retry policy aligns with NFR06's 3-retry requirement. Delivery failures and acknowledgments are audited. |
| FR25-B | Auto-suppression and failure banner | NFR05 (In-app Notification Reliability), NFR13 (Audit Logging) | Banner must be clear and actionable (usability). Suppression is logged in the audit trail. Re-enable actions are audited. |
| FR26-A | Adoption Profile link generation | NFR07 (Access Control), NFR09 (Medical Privacy), NFR10 (Link Anonymity), NFR11 (Asset Protection), NFR12 (Link Integrity), NFR13 (Audit Logging) | Links expose only demographic data (privacy). Links must use opaque tokens (anonymity). Media assets must not be guessable (asset protection). Revoked/expired links must be invalidated (integrity). Link generation is audited. Only Staff+ can generate (access control). |
| FR26-B | Veterinary Profile link generation | NFR07 (Access Control), NFR09 (Medical Privacy), NFR10 (Link Anonymity), NFR11 (Asset Protection), NFR12 (Link Integrity), NFR13 (Audit Logging) | Veterinary links expose medical data (privacy); links must use opaque tokens (anonymity); media assets must not be guessable (asset protection); revoked/expired links must be invalidated (integrity). Link generation is audited. Only Staff+ can generate (access control). |
| FR27 | Configurable link TTL (max 90 days, renewable, no permanent option) | NFR09 (Medical Privacy), NFR10 (Link Anonymity), NFR12 (Link Integrity), NFR13 (Audit Logging) | TTL limits medical data exposure window (privacy). Expired links must be permanently invalidated (integrity). Link URLs use opaque tokens (anonymity). Renewals are audited. |
| FR28-A | Adoption Profile link generation restriction | NFR07 (Access Control), NFR09 (Medical Privacy), NFR12 (Link Integrity) | Restrictions prevent unauthorized data exposure for pets not available for adoption (privacy, integrity). Enforcement is role-gated (access control). |
| FR28-B | Shareable link prohibition for archived pets | NFR07 (Access Control), NFR09 (Medical Privacy), NFR12 (Link Integrity), NFR13 (Audit Logging) | Restrictions prevent unauthorized data exposure for archived pets (privacy, integrity). Enforcement is role-gated (access control). Restriction enforcement events are audited. |
| FR29 | Manual link revocation | NFR07 (Access Control), NFR09 (Medical Privacy), NFR12 (Link Integrity), NFR13 (Audit Logging) | Revocation immediately cuts off external access to data (privacy, integrity). Only authorized staff can revoke (access control). Revocations are audited. |
| FR30-A | Pet search and filtering | NFR01 (Usability), NFR02 (Performance), NFR07 (Access Control), NFR08 (Data Isolation), NFR17 (Global Search) | Search must return results in < 300ms (performance). Results are shelter-scoped (data isolation). Only authorized users can search (access control). FR30-A is a core implementation of NFR17 (global search). Must be intuitive (usability). |
| FR30-B | Inventory search and filtering | NFR01 (Usability), NFR02 (Performance), NFR07 (Access Control), NFR08 (Data Isolation), NFR17 (Global Search) | Search must return results in < 300ms (performance). Results are shelter-scoped (data isolation). Only authorized users can search (access control). FR30-B is a core implementation of NFR17 (global search). Must be intuitive (usability). |
| FR30-C | Maintenance task search and filtering | NFR01 (Usability), NFR02 (Performance), NFR07 (Access Control), NFR08 (Data Isolation), NFR17 (Global Search) | Search must return results in < 300ms (performance). Results are shelter-scoped (data isolation). Only authorized users can search (access control). FR30-C is a core implementation of NFR17 (global search). Must be intuitive (usability). |
| FR31 | Per-shelter dashboard overview | NFR01 (Usability), NFR02 (Performance), NFR07 (Access Control), NFR08 (Data Isolation) | Dashboard must render in < 1 second (performance). KPIs are shelter-scoped (data isolation). Accessible to authorized users only (access control). Must be intuitive and informative (usability). |
| FR32-A | Pet census report | NFR01 (Usability), NFR02 (Performance), NFR07 (Access Control), NFR08 (Data Isolation) | Reports must generate quickly (performance). Shelter-scoped (data isolation). Restricted to authorized roles (access control). Must be easy to generate (usability). |
| FR32-B | Archived pet log report | NFR01 (Usability), NFR02 (Performance), NFR07 (Access Control), NFR08 (Data Isolation), NFR09 (Medical Privacy) | Reports contain PII data (privacy). Restricted to Admin and Staff (access control). Must generate quickly (performance). Shelter-scoped (data isolation). Must be easy to generate (usability). |
| FR32-C | Treatment list report | NFR01 (Usability), NFR02 (Performance), NFR07 (Access Control), NFR08 (Data Isolation) | Reports must generate quickly (performance). Shelter-scoped (data isolation). Restricted to authorized roles (access control). Must be easy to generate (usability). |
| FR33-A | Inventory status report | NFR01 (Usability), NFR02 (Performance), NFR07 (Access Control), NFR08 (Data Isolation) | Reports must generate quickly (performance). Shelter-scoped (data isolation). Restricted to authorized roles (access control). Must be easy to generate (usability). |
| FR33-B | Inventory alert history report | NFR01 (Usability), NFR02 (Performance), NFR07 (Access Control), NFR08 (Data Isolation) | Reports must generate quickly (performance). Shelter-scoped (data isolation). Restricted to authorized roles (access control). Must be easy to generate (usability). |
| FR34-A | Maintenance task status report | NFR01 (Usability), NFR02 (Performance), NFR07 (Access Control), NFR08 (Data Isolation) | Reports must generate quickly (performance). Shelter-scoped (data isolation). Restricted to authorized roles (access control). Must be easy to generate (usability). |
| FR34-B | Cleaning event frequency report | NFR01 (Usability), NFR02 (Performance), NFR07 (Access Control), NFR08 (Data Isolation) | Reports must generate quickly (performance). Shelter-scoped (data isolation). Restricted to authorized roles (access control). Must be easy to generate (usability). |
| FR35-A | Staff headcount report | NFR01 (Usability), NFR02 (Performance), NFR07 (Access Control), NFR08 (Data Isolation), NFR09 (Medical Privacy) | Staff reports contain role data (privacy). Restricted by Admin role only (access control). Shelter-scoped (data isolation). Must be performant and usable. |
| FR35-B | Care event summary report | NFR01 (Usability), NFR02 (Performance), NFR07 (Access Control), NFR08 (Data Isolation) | Reports must generate quickly (performance). Shelter-scoped (data isolation). Restricted to authorized roles (access control). Must be easy to generate (usability). |
| FR36 | Shareable link activity log | NFR07 (Access Control), NFR08 (Data Isolation), NFR09 (Medical Privacy), NFR13 (Audit Logging) | Activity logs may reference medical link types (privacy). Restricted to Admins only (access control). Shelter-scoped (data isolation). Log entries are part of the audit trail. |
| FR37 | User registration and authentication via Google SSO | NFR07 (Access Control), NFR08 (Data Isolation), NFR13 (Audit Logging) | SSO is the Phase 3 authentication gateway enforcing role-based access. Account creation is a significant action requiring audit logging. Data isolation begins at authentication. |
| FR38 | Shelter admin role assignment on creation | NFR07 (Access Control), NFR08 (Data Isolation), NFR13 (Audit Logging) | Shelter creation assigns the Admin role (access control) and establishes a new data isolation boundary. Shelter creation is a significant auditable action. |
| FR39 | Staff invite link generation and redemption | NFR07 (Access Control), NFR08 (Data Isolation), NFR10 (Link Anonymity), NFR13 (Audit Logging) | Invite links assign roles (access control) and grant access to a shelter's data scope. Links must use opaque tokens (link anonymity). Role assignments and invite events are auditable. |
| FR40 | Role-based access control (Admin, Staff, Read-only) | NFR07 (Access Control), NFR08 (Data Isolation), NFR13 (Audit Logging) | FR40 is the direct implementation of NFR07. Role changes affect data isolation scope and are audited. |

---

## 2. FR → Edge Case Mapping

This table maps each FR to the edge cases that test its boundaries.

| FR ID | FR Name | Related Edge Cases |
| :--- | :--- | :--- |
| FR01-A | Local operator profile creation | **Profile data validation** — System validates required fields (name, contact/email) before saving. Incomplete submissions are rejected with field-level errors. |
| FR01-B | Returning operator auto-access | **Corrupted local profile data** — If local profile data is corrupted or missing, system treats user as first-time and presents registration form. |
| FR01-C | Local operator profile edit | **Clearing required fields on edit** — Clearing the name field and submitting highlights it as required and prevents saving. |
| FR02-A | Local shelter creation | **Duplicate shelter names** — Non-unique shelter names are allowed since isolation is per-shelter data container. |
| FR02-B | Local shelter edit | **Clearing required fields on edit** — Clearing the name field and submitting highlights it as required and prevents saving. |
| FR02-C | Local shelter deletion/close | **Shelter with active pets** — All pets must be resolved (archived or transferred) before closure; closed shelters retain historical data in read-only mode. |
| FR03-A | Local data export for a single shelter | **Export with large data volume** — Export of shelters with extensive records (thousands of pets, media references) must complete without data loss; progress indication shown for long-running exports. **Device storage full** — If insufficient local storage exists to save the export, the system displays a clear error and does not produce a partial file. |
| FR03-B | Local data export for all shelters | **Export with large data volume (all shelters)** — Same as single-shelter export but across all shelters. **Device storage full** — If insufficient local storage exists, the system displays a clear error and does not produce a partial file. |
| FR04 | Single-user shelter context switching | **Switching with unsaved changes** — If the operator has unsaved work in the current shelter context, the system warns before switching and offers to save or discard. |
| FR05-A | Pet profile creation | **Duplicate pet profiles** — System does not enforce uniqueness; staff use manual review. **DOB is approximate (estimated flag)** — Estimated DOB is stored normally but displayed with '(Estimated)' label everywhere. **Intake origin 'Other' handling** — 'Other' triggers a required free-text field; stored as enum 'OTHER' + description. |
| FR05-B | Pet profile edit | **Duplicate pet names on edit** — Editing one pet's name to match another is allowed; both pets remain in the active list. |
| FR05-C | Pet profile hard deletion | **Hard delete cancellation** — If user cancels the confirmation dialog, the pet profile remains unchanged. **Hard delete on archived pet** — Hard delete is not available for archived pets; archival is the appropriate action. |
| FR06 | Adoption availability flag toggle | **Toggle on archived pet** — Toggle is disabled and set to false when pet outcome is any archived status. |
| FR07 | Pet media upload (photos/videos) | **Upload failure mid-transfer** — Partial uploads are discarded; user is prompted to retry; no partial files persisted. **File exceeding size limit** — Upload rejected with error displaying the size limit. |
| FR07-B | Pet media deletion | **Deletion confirmation** — Cancelling the confirmation dialog leaves media unchanged. **Cached media in shareable links** — Deletion does not retroactively remove media from already-generated shareable link views. |
| FR08-A | Set outcome to Deceased | **Archived pet with active care events** — All pending/future care events are auto-cancelled on archival; past completed occurrences preserved; shareable links auto-revoked. |
| FR08-B | Set outcome to Transferred (External) | **External transfer preserves full history** — Pet is archived at originating shelter with no shadow record; full history preserved. |
| FR08-C | Set outcome to In Foster | **Reversing In Foster status** — Clearing 'In Foster' returns pet to normal 'Active' status without archival side-effects. |
| FR08-D | Pet archival side-effects | **Pet with no pending care events and no active links** — System performs no additional actions beyond archiving. **Non-archival outcome (In Foster)** — Side-effects do not apply; pet remains in active views. |
| FR09 | Adopter details capture on adoption | **Adopter details missing when setting Adopted status** — Submission is blocked with validation errors until all fields (Name, Phone, Address) are complete. |
| FR10-A | Shadow record creation for internal transfers | **Pet transferred internally then externally from new shelter** — New shelter treats pet as its own; external transfer archives at new shelter; original shadow record remains unchanged. **Staff attempts to transfer a pet to a closed/deleted shelter** — Blocked at selection or mid-transfer. **Pet with active shareable links is transferred internally** — Links auto-revoked at origin; zero links at destination. |
| FR10-B | Migration of active treatments and care events on internal transfer | **Pet with no active treatments or pending care events** — No migration actions performed beyond creating shadow record and new profile. |
| FR11-A | Veterinary directory search and filtering | **Search with no matching clinics** — Empty state displayed indicating no clinics found. |
| FR11-B | Add veterinary clinic to directory | **Duplicate clinic names** — Does not enforce strict uniqueness but warns the user. **Adding clinic with empty name** — System highlights the name field as required and prevents saving. |
| FR11-C | Add veterinarian to directory | **Adding vet without selecting a clinic** — System highlights the clinic selection as required and prevents saving. |
| FR11-D | Edit veterinary clinic in directory | **Clearing required fields on edit** — Clearing the name field highlights it as required and prevents saving. **Edit does not affect existing appointments** — Existing appointments retain the clinic reference regardless of edits. |
| FR11-E | Soft-delete veterinary clinic from directory | **Clinic referenced by appointments** — Soft-delete hides from searches but preserves for existing appointments. **Unreferenced clinic** — Permanently deleted. |
| FR11-F | Edit veterinarian in directory | **Clearing required fields on edit** — Clearing the vet name highlights it as required and prevents saving. |
| FR11-G | Soft-delete veterinarian from directory | **Vet referenced by appointments** — Soft-delete hides from searches but preserves for existing appointments. **Unreferenced vet** — Permanently deleted. |
| FR12-A | Veterinary appointment logging | **Empty notes field** — System highlights the notes field as required and prevents submission. |
| FR12-B | Retroactive appointment date warning | **Retroactive appointment validation** — Allows past dates but prompts user for confirmation. **Cancelling retroactive warning** — Appointment is not saved and form remains open for editing. |
| FR12-C | Edit veterinary appointment | **Past date on edit** — Retroactive date warning displayed per FR12-B. **Edit does not affect linked care events** — Linked care events retain their data regardless of appointment edits. |
| FR13-A | Veterinary document upload | **Upload failure mid-transfer** — Partial uploads are discarded; user is prompted to retry; no partial files persisted. |
| FR13-B | Unsupported file type rejection | **Uploading unsupported file types** — DOCX, EXE, and other non-PDF/JPEG/PNG files are rejected with descriptive error message. |
| FR14 | Appointment soft delete with reference preservation | **Deleted appointment linked to care events** — Soft delete is performed; linked care events display placeholder text: 'Originally linked to appointment [DELETED: YYYY-MM-DD]'. |
| FR15-A | Care event creation | **Empty modality field** — System highlights the modality field as required and prevents submission. **Optional substance field** — Substance is optional for all modalities including Physical Therapy. **Past date for care event** — When a past date is entered, system displays warning and requires confirmation (mirrors FR12-B retroactive pattern). |
| FR15-B | Recurring care event scheduling | **Explicit cancellation of recurring event** — All future occurrences are cancelled and event status marked as 'Cancelled'. |
| FR15-C | Temporary care event with end date | **End date in the past** — System displays a warning and requires confirmation to proceed. |
| FR15-D | Edit care event | **Edit recurring event** — Edits apply to current and future occurrences only; past completed occurrences are preserved unchanged. **Editing modality** — Changing the modality does not affect completed past occurrences. |
| FR15-E | Delete care event | **Delete single occurrence** — Only the selected occurrence is removed. **Cancel all future occurrences** — All future occurrences are cancelled; past completed occurrences remain. |
| FR16 | Care event and appointment optional linking | **Deleted appointment linked to care events** — Soft delete preserves the care event's operational integrity; placeholder text shown on linked care events. |
| FR17 | Care event due-date in-app notification | **Notification delivered to all shelter staff** — All staff of the pet's shelter receive the notification, not just the creating staff. |
| FR18 | Proactive care event reminders (7, 3, 1 day before) | **Care event created with < 7 days until due** — Only applicable future reminders are sent (e.g., skips 7-day and 3-day reminders if created 2 days prior). |
| FR19-A | Inventory item creation | **Empty name field** — System highlights the name field as required and prevents submission. **Past purchase date** — When a past purchase date is entered, system accepts it but displays a warning that the item may already be in use. **Past expiration date** — When an expiration date in the past is entered, system warns that the item is already expired and may reject or require confirmation. |
| FR19-B | Inventory quantity adjustment | **Negative quantity prevention** — Setting quantity below zero is prevented with error. |
| FR19-C | Delete inventory item | **Item with active alerts** — Alert rules are also removed. **Audit log preservation** — Item name is preserved in historical audit log entries. |
| FR20-A | Quantity threshold alert rule | **Threshold of 0 disables alert** — When threshold is set to 0, no alert is triggered even if quantity drops below 0. |
| FR20-B | Expiration window alert rule | **Window of 0 disables alert** — When warning window is set to 0, no alert is triggered even when item expires. |
| FR21-A | Inventory usage template decrement from care events | **Care event without inventory link** — Care event is saved without any inventory adjustment when no inventory item is selected. |
| FR21-B | Insufficient stock handling on template decrement | **Insufficient stock warning** — System displays warning with available vs required quantities; care event is saved without inventory link. **Acknowledging insufficient stock warning** — Care event is saved and no inventory adjustment is made. |
| FR21-C | Inventory adjustment reversal with audit tracking | **Reversal audit trail** — All adjustments (creates, decrements, reversals) are listed chronologically with full details in the audit log. |
| FR22-A | Single maintenance task creation | **Empty description field** — System highlights the description field as required and prevents submission. **Past scheduled date** — When a past scheduled date is entered, system displays warning and requires confirmation (mirrors FR12-B retroactive pattern). |
| FR22-B | Recurring maintenance task creation | **Future occurrences individually editable** — Each generated occurrence can be edited or cancelled independently. |
| FR22-C | Edit maintenance task | **Propagation to future occurrences** — When editing a recurring task, user chooses whether to propagate to future occurrences or edit only the current one. |
| FR22-D | Delete/cancel maintenance task | **Cancel recurring future** — Future occurrences cancelled; past completed occurrences remain for reporting. **Single task deletion** — Task removed from active views. |
| FR23-A | Maintenance task notifications | **Overdue task reminders** — Overdue tasks remain visible and continue to trigger reminders until completed. |
| FR23-B | Maintenance task completion tracking | **Completed task remains in data store** — Completed tasks are not deleted; they remain for reporting purposes. |
| FR24 | Two-tier notification delivery | **Standard mode delivers only in-app** — When Standard mode is selected, no email or push notifications are sent. **Custom mode delivers all configured channels** — When Custom mode is selected, in-app + email + push are all delivered. |
| FR25-A | Notification delivery status tracking and retry | **Notification delivery failure after retries** — After 3 failed retries, notification is flagged 'FAILED'; non-dismissible in-app banner shown until acknowledged. |
| FR25-B | Auto-suppression and failure banner | **Acknowledging failure banner** — Banner is dismissed, channel is re-enabled, and acknowledgment is logged. **Admin manually re-enabling suppressed channel** — Delivery is restored for the user on that channel. |
| FR26-A | Adoption Profile link generation | **Expired/revoked link accessed** — System returns a clear, non-revealing denial page with no data, error details, or internal identifiers exposed. **Pet not available for adoption** — Link generation denied if 'Available for Adoption' flag is false. |
| FR26-B | Veterinary Profile link generation | **Expired/revoked link accessed** — System returns a clear, non-revealing denial page with no data, error details, or internal identifiers exposed. **Archived pet with active care events** — All active shareable links auto-revoked on archival; new links forbidden. |
| FR27 | Configurable link TTL (max 90 days, renewable, no permanent option) | **Expired/revoked link accessed** — Expired link returns denial page; no cached or stale data served. **TTL exceeding maximum** — System rejects configuration and displays the maximum allowed TTL. |
| FR28-A | Adoption Profile link generation restriction | **Pet not available for adoption** — Link generation is denied with error indicating pet is not available for adoption. |
| FR28-B | Shareable link prohibition for archived pets | **Archived pet with active care events** — New shareable links are strictly forbidden for archived pets. **Auto-revocation on archival** — All active links are automatically revoked; subsequent access returns denial. |
| FR29 | Manual link revocation | **Expired/revoked link accessed** — Revoked link immediately and permanently returns denial response. **Attempting to revoke already-inactive link** — System indicates the link is already inactive. |
| FR30-A | Pet search and filtering | **Search yields empty results** — Graceful empty state shown instead of raw database errors. **Filtering by adoption availability** — Only pets with 'Available for Adoption' set to true are shown when filtered. |
| FR30-B | Inventory search and filtering | **Search yields empty results** — Graceful empty state shown instead of raw database errors. **Filtering by alert status** — Only items below their configured quantity threshold are shown when filtered by 'Low Stock'. |
| FR30-C | Maintenance task search and filtering | **Search yields empty results** — Graceful empty state shown instead of raw database errors. **Filtering by overdue status** — Only tasks past their scheduled date and not yet completed are shown. |
| FR31 | Per-shelter dashboard overview | **Stale dashboard data** — Caches data for performance but auto-refreshes after 5 mins of inactivity or manually. **Pet being archived** — Dashboard active pet count decreases by one on refresh. |
| FR32-A | Pet census report | **Report with no active pets** — Empty state displayed indicating no active pets in the selected date range. |
| FR32-B | Archived pet log report | **Adopted pets include adopter PII** — Adopter details (Name, Phone, Address) are included for Adopted outcomes; restricted per NFR09. **Deceased pets without adopter details** — No adopter details displayed for deceased pets. |
| FR32-C | Treatment list report | **No active temporary care events** — Empty state displayed indicating no active treatments. |
| FR33-A | Inventory status report | **Items highlighted by threshold** — Below-threshold items highlighted in red; near-expiry items highlighted in yellow per configurable thresholds. |
| FR33-B | Inventory alert history report | **No alerts in range** — Empty state displayed when no alerts occurred within the selected period. |
| FR34-A | Maintenance task status report | **Task completion attribution** — Completion timestamps and completing staff member names are displayed. |
| FR34-B | Cleaning event frequency report | **No cleaning tasks in range** — Count of 0 is displayed when no cleaning tasks were completed in the selected range. |
| FR35-A | Staff headcount report | **Admin-only access** — Staff users attempting to generate this report are denied access. |
| FR35-B | Care event summary report | **No care events in range** — Counts of 0 are displayed for all modalities when no care events occurred in the selected period. |
| FR36 | Shareable link activity log | **Staff accessing another shelter's log** — Access is denied; log is scoped to current shelter. |
| FR37 | User registration and authentication via Google SSO | **Google SSO provider temporarily unavailable** — System handles outages gracefully without losing active sessions. Displays a clear error page if SSO is temporarily unavailable. |
| FR38 | Shelter admin role assignment on creation | **Duplicate shelter names** — Non-unique names are allowed since isolation is tenant-based. |
| FR39 | Staff invite link generation and redemption | **Email mismatch on invite redemption** — Rejects redemption if authenticated email differs from invited email. **Expired invite link access** — Returns clear error for expired invitations. **Resending invalidates previous** — Previous pending invite link is invalidated when a new one is generated. |
| FR40 | Role-based access control (Admin, Staff, Read-only) | **Last Admin leaves a shelter** — System prevents the last Admin from being removed; must promote another user first or delete the shelter entirely. **Read-only user attempting write action** — Action is denied immediately. |

---

## 3. FR → State Machine Mapping

This table maps each FR to the state machine(s) it participates in.

| FR ID | FR Name | State Machine(s) |
| :--- | :--- | :--- |
| FR01-A | Local operator profile creation | *(No state machine — profile creation is a one-time setup action)* |
| FR01-B | Returning operator auto-access | *(No state machine — auto-access is a session initialization action)* |
| FR01-C | Local operator profile edit | *(No state machine — edit operation does not change lifecycle state)* |
| FR02-A | Local shelter creation | *(No state machine — shelter creation is a setup action)* |
| FR02-B | Local shelter edit | *(No state machine — edit operation does not change lifecycle state)* |
| FR02-C | Local shelter deletion/close | Shelter Lifecycle (Open → Closed/Read-only) |
| FR03-A | Local data export for a single shelter | *(No state machine — export is a single action: Initiated → Completed/Failed)* |
| FR03-B | Local data export for all shelters | *(No state machine — export is a single action: Initiated → Completed/Failed)* |
| FR04 | Single-user shelter context switching | *(No state machine — context switch is a navigation action)* |
| FR05-A | Pet profile creation | Pet Lifecycle (Intake → Active) |
| FR05-B | Pet profile edit | *(No state machine — edit operation does not change lifecycle state)* |
| FR05-C | Pet profile hard deletion | *(No state machine — hard delete is a destructive utility, not a lifecycle transition)* |
| FR06 | Adoption availability flag toggle | Pet Lifecycle (flag state change, does not transition lifecycle) |
| FR07 | Pet media upload (photos/videos) | *(No state machine — utility attachment operation)* |
| FR07-B | Pet media deletion | *(No state machine — utility deletion operation)* |
| FR08-A | Set outcome to Deceased | Pet Lifecycle (Active → Deceased → Archived), Care Event (Scheduled → Cancelled on archival) |
| FR08-B | Set outcome to Transferred (External) | Pet Lifecycle (Active → Transferred (External) → Archived) |
| FR08-C | Set outcome to In Foster | Pet Lifecycle (Active → In Foster — reversible, no archival) |
| FR08-D | Pet archival side-effects | Pet Lifecycle (archival auto-triggers care event cancellation and link revocation), Shareable Link Lifecycle (Active → Revoked on archival) |
| FR09 | Adopter details capture on adoption | Pet Lifecycle (Active → Adopted → Archived — adoption form is required during this transition) |
| FR10-A | Shadow record creation for internal transfers | Pet Lifecycle (Active → Transferred (Internal) → Archived), Shadow Record (Created as read-only reference) |
| FR10-B | Migration of active treatments and care events on internal transfer | Care Event (migrated to new shelter's active profile with preserved recurrence schedules) |
| FR11-A | Veterinary directory search and filtering | *(No state machine — reference data query operation)* |
| FR11-B | Add veterinary clinic to directory | *(No state machine — reference data creation operation)* |
| FR11-C | Add veterinarian to directory | *(No state machine — reference data creation operation)* |
| FR11-D | Edit veterinary clinic in directory | *(No state machine — reference data edit operation)* |
| FR11-E | Soft-delete veterinary clinic from directory | *(No state machine — soft-delete is a visibility toggle, not a lifecycle transition)* |
| FR11-F | Edit veterinarian in directory | *(No state machine — reference data edit operation)* |
| FR11-G | Soft-delete veterinarian from directory | *(No state machine — soft-delete is a visibility toggle, not a lifecycle transition)* |
| FR12-A | Veterinary appointment logging | Appointment Lifecycle (Active) |
| FR12-B | Retroactive appointment date warning | *(No state machine — validation/dialog, not a state transition)* |
| FR12-C | Edit veterinary appointment | Appointment Lifecycle (Active — edit does not change lifecycle state) |
| FR13-A | Veterinary document upload | *(No state machine — utility attachment operation)* |
| FR13-B | Unsupported file type rejection | *(No state machine — validation rejection, not a state transition)* |
| FR14 | Appointment soft delete with reference preservation | Appointment Lifecycle (Active → Soft-Deleted) |
| FR15-A | Care event creation | Care Event Lifecycle (creation of Scheduled state) |
| FR15-B | Recurring care event scheduling | Care Event Lifecycle (Scheduled → Recurring occurrences scheduled), Notification (Pending → Delivered on each occurrence) |
| FR15-C | Temporary care event with end date | Care Event Lifecycle (Scheduled → Completed on end date), Notification (Pending → Delivered until end date) |
| FR15-D | Edit care event | Care Event Lifecycle (edit does not change lifecycle state; future occurrences rescheduled) |
| FR15-E | Delete care event | Care Event Lifecycle (Scheduled → Cancelled) |
| FR16 | Care event and appointment optional linking | *(No state machine — link is informational only, no state transition)* |
| FR17 | Care event due-date in-app notification | Care Event Lifecycle (Due state transition triggers notification), Notification (Pending → Delivered) |
| FR18 | Proactive care event reminders (7, 3, 1 day before) | Care Event Lifecycle (Scheduled → Reminder Sent 7d → 3d → 1d → Due) |
| FR19-A | Inventory item creation | *(No state machine — reference data creation operation)* |
| FR19-B | Inventory quantity adjustment | *(No state machine — utility update operation)* |
| FR19-C | Delete inventory item | *(No state machine — destructive utility operation)* |
| FR20-A | Quantity threshold alert rule | *(No state machine — rule configuration, alerts are side-effects not states)* |
| FR20-B | Expiration window alert rule | *(No state machine — rule configuration, alerts are side-effects not states)* |
| FR21-A | Inventory usage template decrement from care events | *(No state machine — utility decrement triggered by care event)* |
| FR21-B | Insufficient stock handling on template decrement | *(No state machine — validation warning, no state transition)* |
| FR21-C | Inventory adjustment reversal with audit tracking | *(No state machine — audit trail operation)* |
| FR22-A | Single maintenance task creation | Maintenance Task Lifecycle (Created → Assigned) |
| FR22-B | Recurring maintenance task creation | Maintenance Task Lifecycle (Created → Assigned with future occurrences generated), Maintenance Task (each occurrence follows Created → Assigned → Completed/Overdue) |
| FR22-C | Edit maintenance task | Maintenance Task Lifecycle (edit does not change lifecycle state) |
| FR22-D | Delete/cancel maintenance task | Maintenance Task Lifecycle (Created/Assigned → Cancelled) |
| FR23-A | Maintenance task notifications | Maintenance Task Lifecycle (In Progress → Completed, Created/Assigned → Overdue), Notification (Pending → Delivered) |
| FR23-B | Maintenance task completion tracking | Maintenance Task Lifecycle (Completed — timestamp and attribution logged) |
| FR24 | Two-tier notification delivery (Standard in-app + Custom email/push) | Notification Lifecycle (Pending → Delivered or Pending → Retrying) |
| FR25-A | Notification delivery status tracking and retry | Notification Lifecycle (Retrying 1 → 2 → 3 → Failed → Acknowledged) |
| FR26-A | Adoption Profile link generation | Shareable Link Lifecycle (creation of Active state — Adoption type) |
| FR26-B | Veterinary Profile link generation | Shareable Link Lifecycle (creation of Active state — Veterinary type) |
| FR27 | Configurable link TTL (max 90 days, renewable, no permanent option) | Shareable Link Lifecycle (Active → Expired, Active → Renewed → Active) |
| FR28-A | Adoption Profile link generation restriction | Shareable Link Lifecycle (governs whether Active state can be created for Adoption type), Pet Lifecycle ('Available for Adoption' flag gating) |
| FR28-B | Shareable link prohibition for archived pets | Shareable Link Lifecycle (governs whether Active state can be created), Pet Lifecycle (archival auto-revokes links) |
| FR29 | Manual link revocation | Shareable Link Lifecycle (Active → Revoked) |
| FR30-A | Pet search and filtering | *(No state machine — query operation)* |
| FR30-B | Inventory search and filtering | *(No state machine — query operation)* |
| FR30-C | Maintenance task search and filtering | *(No state machine — query operation)* |
| FR31 | Per-shelter dashboard overview | *(No state machine — read-only aggregate view)* |
| FR32-A | Pet census report | *(No state machine — reporting operation)* |
| FR32-B | Archived pet log report | *(No state machine — reporting operation)* |
| FR32-C | Treatment list report | *(No state machine — reporting operation)* |
| FR33-A | Inventory status report | *(No state machine — reporting operation)* |
| FR33-B | Inventory alert history report | *(No state machine — reporting operation)* |
| FR34-A | Maintenance task status report | *(No state machine — reporting operation)* |
| FR34-B | Cleaning event frequency report | *(No state machine — reporting operation)* |
| FR35-A | Staff headcount report | *(No state machine — reporting operation)* |
| FR35-B | Care event summary report | *(No state machine — reporting operation)* |
| FR36 | Shareable link activity log | *(No state machine — audit log view)* |
| FR39 | Staff invite link generation and redemption | Invite Link Lifecycle (Pending → Redeemed / Expired / Invalidated) |

---

## 4. FR → Process Flow Mapping

This table maps each FR to the process flow(s) where it appears.

| FR ID | FR Name | Process Flow(s) |
| :--- | :--- | :--- |
| FR01-A | Local operator profile creation | 1. Operator Registration and Local Shelter Setup |
| FR01-B | Returning operator auto-access | 1. Operator Registration and Local Shelter Setup (returning user flow) |
| FR01-C | Local operator profile edit | 1. Operator Registration and Local Shelter Setup (profile management) |
| FR02-A | Local shelter creation | 1. Operator Registration and Local Shelter Setup |
| FR02-B | Local shelter edit | 1. Operator Registration and Local Shelter Setup (shelter management) |
| FR02-C | Local shelter deletion/close | 1. Operator Registration and Local Shelter Setup (shelter closure) |
| FR03-A | Local data export for a single shelter | 12. Data Export |
| FR03-B | Local data export for all shelters | 12. Data Export |
| FR04 | Single-user shelter context switching | 1. Operator Registration and Local Shelter Setup (shelter selector usage) |
| FR05-A | Pet profile creation | 2. Pet Registration |
| FR05-B | Pet profile edit | 2. Pet Registration (edit flow) |
| FR05-C | Pet profile hard deletion | 2. Pet Registration (deletion flow) |
| FR06 | Adoption availability flag toggle | 2. Pet Registration, 7. Profile Sharing (prerequisite for Adoption links) |
| FR07 | Pet media upload (photos/videos) | 2. Pet Registration, 7. Profile Sharing (media visible in shared profiles) |
| FR07-B | Pet media deletion | 2. Pet Registration (media management flow) |
| FR08-A | Set outcome to Deceased | 8. Pet Archiving and Transfer |
| FR08-B | Set outcome to Transferred (External) | 8. Pet Archiving and Transfer |
| FR08-C | Set outcome to In Foster | 8. Pet Archiving and Transfer |
| FR08-D | Pet archival side-effects | 8. Pet Archiving and Transfer (auto-side-effects on all archival outcomes) |
| FR09 | Adopter details capture on adoption | 8. Pet Archiving and Transfer (Adopted outcome requires adopter form) |
| FR10-A | Shadow record creation for internal transfers | 8. Pet Archiving and Transfer (Internal transfer creates shadow record) |
| FR10-B | Migration of active treatments and care events on internal transfer | 8. Pet Archiving and Transfer (treatment migration during internal transfer) |
| FR11-A | Veterinary directory search and filtering | 3. Veterinary Appointment |
| FR11-B | Add veterinary clinic to directory | 3. Veterinary Appointment |
| FR11-C | Add veterinarian to directory | 3. Veterinary Appointment |
| FR11-D | Edit veterinary clinic in directory | 3. Veterinary Appointment (directory management) |
| FR11-E | Soft-delete veterinary clinic from directory | 3. Veterinary Appointment (directory management) |
| FR11-F | Edit veterinarian in directory | 3. Veterinary Appointment (directory management) |
| FR11-G | Soft-delete veterinarian from directory | 3. Veterinary Appointment (directory management) |
| FR12-A | Veterinary appointment logging | 3. Veterinary Appointment |
| FR12-B | Retroactive appointment date warning | 3. Veterinary Appointment (retroactive entry flow) |
| FR12-C | Edit veterinary appointment | 3. Veterinary Appointment (edit flow) |
| FR13-A | Veterinary document upload | 3. Veterinary Appointment |
| FR13-B | Unsupported file type rejection | 3. Veterinary Appointment (validation flow) |
| FR14 | Appointment soft delete with reference preservation | 3. Veterinary Appointment (deletion rules for linked appointments) |
| FR15-A | Care event creation | 4. Pet Care Event |
| FR15-B | Recurring care event scheduling | 4. Pet Care Event (recurring schedule flow) |
| FR15-C | Temporary care event with end date | 4. Pet Care Event (temporary treatment flow) |
| FR15-D | Edit care event | 4. Pet Care Event (edit flow) |
| FR15-E | Delete care event | 4. Pet Care Event (deletion flow) |
| FR16 | Care event and appointment optional linking | 3. Veterinary Appointment, 4. Pet Care Event |
| FR17 | Care event due-date in-app notification | 4. Pet Care Event, 9. Notification Failure Escalation |
| FR18 | Proactive care event reminders (7, 3, 1 day before) | 4. Pet Care Event, 9. Notification Failure Escalation |
| FR19-A | Inventory item creation | 5. Inventory Management and Alert |
| FR19-B | Inventory quantity adjustment | 5. Inventory Management and Alert (manual adjustment flow) |
| FR19-C | Delete inventory item | 5. Inventory Management and Alert (deletion flow) |
| FR20-A | Quantity threshold alert rule | 5. Inventory Management and Alert |
| FR20-B | Expiration window alert rule | 5. Inventory Management and Alert |
| FR21-A | Inventory usage template decrement from care events | 4. Pet Care Event, 5. Inventory Management and Alert |
| FR21-B | Insufficient stock handling on template decrement | 4. Pet Care Event (insufficient stock warning flow) |
| FR21-C | Inventory adjustment reversal with audit tracking | 5. Inventory Management and Alert (reversal flow) |
| FR22-A | Single maintenance task creation | 6. Maintenance Task |
| FR22-B | Recurring maintenance task creation | 6. Maintenance Task (recurring schedule flow) |
| FR22-C | Edit maintenance task | 6. Maintenance Task (edit flow) |
| FR22-D | Delete/cancel maintenance task | 6. Maintenance Task (deletion/cancellation flow) |
| FR23-A | Maintenance task notifications | 6. Maintenance Task, 9. Notification Failure Escalation |
| FR23-B | Maintenance task completion tracking | 6. Maintenance Task (completion flow) |
| FR24 | Two-tier notification delivery (Standard in-app + Custom email/push) | 5. Inventory Management and Alert, 6. Maintenance Task, 9. Notification Failure Escalation |
| FR25-A | Notification delivery status tracking and retry | 5. Inventory Management and Alert, 9. Notification Failure Escalation |
| FR25-B | Auto-suppression and failure banner | 9. Notification Failure Escalation (banner display and acknowledgment flow) |
| FR26-A | Adoption Profile link generation | 7. Profile Sharing |
| FR26-B | Veterinary Profile link generation | 7. Profile Sharing |
| FR27 | Configurable link TTL (max 90 days, renewable, no permanent option) | 7. Profile Sharing |
| FR28-A | Adoption Profile link generation restriction | 7. Profile Sharing (gating check), 8. Pet Archiving and Transfer |
| FR28-B | Shareable link prohibition for archived pets | 7. Profile Sharing, 8. Pet Archiving and Transfer (new links forbidden for archived pets) |
| FR29 | Manual link revocation | 7. Profile Sharing |
| FR30-A | Pet search and filtering | 11. Dashboard and Search Usage |
| FR30-B | Inventory search and filtering | 11. Dashboard and Search Usage |
| FR30-C | Maintenance task search and filtering | 11. Dashboard and Search Usage |
| FR31 | Per-shelter dashboard overview | 11. Dashboard and Search Usage |
| FR32-A | Pet census report | 10. Report Generation and Consumption |
| FR32-B | Archived pet log report | 10. Report Generation and Consumption |
| FR32-C | Treatment list report | 10. Report Generation and Consumption |
| FR33-A | Inventory status report | 10. Report Generation and Consumption |
| FR33-B | Inventory alert history report | 10. Report Generation and Consumption |
| FR34-A | Maintenance task status report | 10. Report Generation and Consumption |
| FR34-B | Cleaning event frequency report | 10. Report Generation and Consumption |
| FR35-A | Staff headcount report | 10. Report Generation and Consumption |
| FR35-B | Care event summary report | 10. Report Generation and Consumption |
| FR36 | Shareable link activity log | 10. Report Generation and Consumption |
| FR37 | User registration and authentication via Google SSO | 1. Operator Registration and Local Shelter Setup (Phase 3 replaces local profile with SSO) |
| FR38 | Shelter admin role assignment on creation | 1. Operator Registration and Local Shelter Setup (Phase 3 adds admin role assignment) |
| FR39 | Staff invite link generation and redemption | 1. Operator Registration and Local Shelter Setup (Phase 3 adds staff onboarding) |
| FR40 | Role-based access control (Admin, Staff, Read-only) | 1. Operator Registration and Local Shelter Setup (Phase 3 adds role enforcement on all operations) |

---

## 5. FR → BRD Success Criteria Mapping

This table maps FRs to the Business Success Criteria (KPIs) they support.

| FR ID | FR Name | BRD KPI(s) Supported |
| :--- | :--- | :--- |
| FR01-A | Local operator profile creation | KPI-07 (Operator engagement): Frictionless local access removes barriers to daily use. |
| FR01-B | Returning operator auto-access | KPI-07 (Operator engagement): Instant return access eliminates login friction. |
| FR01-C | Local operator profile edit | KPI-07 (Operator engagement): Easy profile updates maintain accurate contact information. |
| FR02-A | Local shelter creation | KPI-05 (Administrative overhead): Self-service local shelter setup reduces setup time. KPI-07 (Operator engagement): Multi-shelter capability supports operational growth. |
| FR02-B | Local shelter edit | KPI-05 (Administrative overhead): Quick shelter updates reduce administrative friction. |
| FR02-C | Local shelter deletion/close | KPI-05 (Administrative overhead): Safe closure process prevents accidental data loss. |
| FR03-A | Local data export for a single shelter | KPI-04 (Lost medical records): Data exports serve as backup, preventing data loss. KPI-05 (Administrative overhead): Export simplifies future migration. |
| FR03-B | Local data export for all shelters | KPI-04 (Lost medical records): Comprehensive backup prevents data loss across all shelters. KPI-05 (Administrative overhead): Simplifies future migration. |
| FR04 | Single-user shelter context switching | KPI-05 (Administrative overhead): Quick context switching reduces time navigating between shelters. |
| FR05-A | Pet profile creation | KPI-01 (Time to retrieve medical record): Structured digital profiles enable instant retrieval. KPI-04 (Lost medical records): Digital profiles eliminate paper-loss risk. KPI-05 (Administrative overhead): Replaces manual paper filing. |
| FR05-B | Pet profile edit | KPI-01 (Time to retrieve medical record): Quick edits keep medical records current. KPI-05 (Administrative overhead): Easy updates reduce administrative burden. |
| FR05-C | Pet profile hard deletion | KPI-04 (Lost medical records): Hard deletion is a controlled action; archival preserves history for recovery. |
| FR06 | Adoption availability flag toggle | KPI-06 (Adoption rate): Enables adoption-eligible pets to be discoverable. |
| FR07 | Pet media upload (photos/videos) | KPI-06 (Adoption rate): Photos/videos in adoption profiles increase adopter engagement. |
| FR07-B | Pet media deletion | KPI-06 (Adoption rate): Removing outdated media keeps adoption profiles current. |
| FR08-A | Set outcome to Deceased | KPI-05 (Administrative overhead): Digital lifecycle tracking replaces manual records. KPI-06 (Adoption rate): Accurate tracking of adoption outcomes. |
| FR08-B | Set outcome to Transferred (External) | KPI-04 (Lost medical records): Transfer preserves full history. KPI-05 (Administrative overhead): Digital tracking replaces manual records. |
| FR08-C | Set outcome to In Foster | KPI-06 (Adoption rate): Foster status tracking supports better placement outcomes. KPI-05 (Administrative overhead): Digital status updates replace manual logs. |
| FR08-D | Pet archival side-effects | KPI-04 (Lost medical records): Auto-side-effects ensure data integrity during archival. KPI-03 (Treatment compliance): Cancelled care events prevent duplicate treatments. |
| FR09 | Adopter details capture on adoption | KPI-06 (Adoption rate): Structured adoption records support better follow-up. KPI-05 (Administrative overhead): Digital capture replaces paper forms. |
| FR10-A | Shadow record creation for internal transfers | KPI-04 (Lost medical records): Transfer preserves full history via shadow records. KPI-03 (Treatment compliance): Active treatments are migrated to the receiving shelter. |
| FR10-B | Migration of active treatments and care events on internal transfer | KPI-03 (Treatment compliance): Care continuity is preserved across shelters. KPI-04 (Lost medical records): Treatment history is fully migrated. |
| FR11-A | Veterinary directory search and filtering | KPI-01 (Time to retrieve medical record): Quick vet lookup during appointments. KPI-05 (Administrative overhead): Searchable directory eliminates redundant data entry. |
| FR11-B | Add veterinary clinic to directory | KPI-05 (Administrative overhead): Reusable directory entries eliminate redundant data entry. |
| FR11-C | Add veterinarian to directory | KPI-05 (Administrative overhead): Linked vet entries streamline appointment scheduling. |
| FR11-D | Edit veterinary clinic in directory | KPI-05 (Administrative overhead): Quick directory updates reduce rework. |
| FR11-E | Soft-delete veterinary clinic from directory | KPI-05 (Administrative overhead): Directory cleanup reduces clutter while preserving historical data. |
| FR11-F | Edit veterinarian in directory | KPI-05 (Administrative overhead): Quick directory updates reduce rework. |
| FR11-G | Soft-delete veterinarian from directory | KPI-05 (Administrative overhead): Directory cleanup reduces clutter while preserving historical data. |
| FR12-A | Veterinary appointment logging | KPI-01 (Time to retrieve medical record): Appointments are part of retrievable medical history. KPI-04 (Lost medical records): Digital appointment records cannot be physically lost. |
| FR12-B | Retroactive appointment date warning | KPI-01 (Time to retrieve medical record): Retroactive entries preserve complete medical history. |
| FR12-C | Edit veterinary appointment | KPI-01 (Time to retrieve medical record): Editable appointments keep medical records accurate. KPI-05 (Administrative overhead): In-place edits reduce rework. |
| FR13-A | Veterinary document upload | KPI-01 (Time to retrieve medical record): Documents are digitally attached and searchable. KPI-04 (Lost medical records): Uploaded documents replace paper originals. |
| FR13-B | Unsupported file type rejection | KPI-05 (Administrative overhead): Clear validation prevents invalid uploads and rework. |
| FR14 | Appointment soft delete with reference preservation | KPI-04 (Lost medical records): Soft delete preserves data integrity; linked references remain. |
| FR15-A | Care event creation | KPI-01 (Time to retrieve medical record): Care events are part of the digital record. KPI-03 (Treatment compliance): Structured scheduling ensures treatments are tracked. KPI-04 (Lost medical records): Digital care records are permanent. |
| FR15-B | Recurring care event scheduling | KPI-03 (Treatment compliance): Recurring schedules ensure treatments are never missed. KPI-05 (Administrative overhead): Automation reduces manual scheduling burden. |
| FR15-C | Temporary care event with end date | KPI-03 (Treatment compliance): End dates ensure temporary treatments are tracked and completed. |
| FR15-D | Edit care event | KPI-03 (Treatment compliance): Correctable care events ensure accurate treatment tracking. KPI-05 (Administrative overhead): In-place edits reduce rework. |
| FR15-E | Delete care event | KPI-03 (Treatment compliance): Removing erroneous care events maintains data accuracy. |
| FR16 | Care event and appointment optional linking | KPI-01 (Time to retrieve medical record): Bidirectional links enable fast cross-referencing between appointments and care events. |
| FR17 | Care event due-date in-app notification | KPI-03 (Treatment compliance): On-due-date alerts ensure no treatment is missed. |
| FR18 | Proactive care event reminders (7, 3, 1 day before) | KPI-03 (Treatment compliance): Advance reminders give staff time to prepare and schedule. |
| FR19-A | Inventory item creation | KPI-02 (Expired inventory waste): Tracking expiration dates prevents waste. KPI-05 (Administrative overhead): Digital inventory replaces manual tracking. |
| FR19-B | Inventory quantity adjustment | KPI-02 (Expired inventory waste): Accurate quantity tracking prevents over-stocking. KPI-05 (Administrative overhead): Manual adjustments are quick and audited. |
| FR19-C | Delete inventory item | KPI-02 (Expired inventory waste): Removing discontinued items keeps inventory accurate. KPI-05 (Administrative overhead): Cleanup reduces clutter. |
| FR20-A | Quantity threshold alert rule | KPI-02 (Expired inventory waste): Proactive low-stock alerts prevent items from going unnoticed. KPI-05 (Administrative overhead): Automated alerts replace manual checks. |
| FR20-B | Expiration window alert rule | KPI-02 (Expired inventory waste): Proactive expiration alerts prevent items from going unnoticed. KPI-05 (Administrative overhead): Automated alerts replace manual checks. |
| FR21-A | Inventory usage template decrement from care events | KPI-02 (Expired inventory waste): Accurate usage tracking prevents over-stocking. KPI-03 (Treatment compliance): Links care administration to inventory for accountability. KPI-05 (Administrative overhead): 1-click workflow saves time. |
| FR21-B | Insufficient stock handling on template decrement | KPI-02 (Expired inventory waste): Warnings prevent accidental over-decrement and stock errors. |
| FR21-C | Inventory adjustment reversal with audit tracking | KPI-05 (Administrative overhead): Reversals are audited for accountability and error correction. |
| FR22-A | Single maintenance task creation | KPI-05 (Administrative overhead): Digital scheduling replaces verbal coordination. |
| FR22-B | Recurring maintenance task creation | KPI-05 (Administrative overhead): Automated recurrence reduces manual scheduling burden. |
| FR22-C | Edit maintenance task | KPI-05 (Administrative overhead): Editable tasks reduce need to delete and recreate. |
| FR22-D | Delete/cancel maintenance task | KPI-05 (Administrative overhead): Cancelling obsolete tasks keeps the task list actionable. |
| FR23-A | Maintenance task notifications | KPI-05 (Administrative overhead): Automated notifications eliminate verbal reminders. KPI-07 (Staff platform adoption): Reliable alerts build trust in the platform. |
| FR23-B | Maintenance task completion tracking | KPI-05 (Administrative overhead): Completion attribution enables accountability and reporting. |
| FR24 | Two-tier notification delivery (Standard in-app + Custom email/push) | KPI-03 (Treatment compliance): Multi-channel delivery ensures critical reminders are received. KPI-07 (Staff platform adoption): Flexible notification preferences improve UX. |
| FR25-A | Notification delivery status tracking and retry | KPI-03 (Treatment compliance): Failure escalation ensures no notification silently fails. KPI-07 (Staff platform adoption): Transparency into delivery status builds platform trust. |
| FR25-B | Auto-suppression and failure banner | KPI-07 (Staff platform adoption): Failure banners with acknowledgment build trust through transparency. |
| FR26-A | Adoption Profile link generation | KPI-06 (Adoption rate): Adoption links enable remote profile browsing by potential adopters. |
| FR26-B | Veterinary Profile link generation | KPI-01 (Time to retrieve medical record): Veterinary links provide instant access to medical data. |
| FR27 | Configurable link TTL (max 90 days, renewable, no permanent option) | KPI-06 (Adoption rate): Renewable links ensure profiles remain available during adoption cycles. |
| FR28-A | Adoption Profile link generation restriction | KPI-06 (Adoption rate): Ensures only genuinely available pets have adoption links. |
| FR28-B | Shareable link prohibition for archived pets | KPI-06 (Adoption rate): Prevents stale or misleading links for archived pets. |
| FR29 | Manual link revocation | KPI-06 (Adoption rate): Keeps shared profile inventory current by removing stale links. |
| FR30-A | Pet search and filtering | KPI-01 (Time to retrieve medical record): Fast search enables rapid record retrieval. KPI-05 (Administrative overhead): Filters reduce time spent locating information. |
| FR30-B | Inventory search and filtering | KPI-05 (Administrative overhead): Fast inventory search reduces time locating supplies. |
| FR30-C | Maintenance task search and filtering | KPI-05 (Administrative overhead): Fast task search reduces time locating maintenance items. |
| FR31 | Per-shelter dashboard overview | KPI-05 (Administrative overhead): At-a-glance overview eliminates manual status compilation. KPI-07 (Staff platform adoption): A rich dashboard is the operational hub driving daily usage. |
| FR32-A | Pet census report | KPI-06 (Adoption rate): Census data supports adoption planning and capacity management. KPI-05 (Administrative overhead): Automated reporting replaces manual compilation. |
| FR32-B | Archived pet log report | KPI-06 (Adoption rate): Archived adoption logs support outcome tracking and follow-up. KPI-05 (Administrative overhead): Automated reporting replaces manual compilation. |
| FR32-C | Treatment list report | KPI-03 (Treatment compliance): Treatment lists enable compliance monitoring. |
| FR33-A | Inventory status report | KPI-02 (Expired inventory waste): Status reports highlight at-risk items. KPI-05 (Administrative overhead): Automated inventory reporting. |
| FR33-B | Inventory alert history report | KPI-02 (Expired inventory waste): Alert history supports trend analysis and prevention. KPI-05 (Administrative overhead): Automated alert reporting. |
| FR34-A | Maintenance task status report | KPI-05 (Administrative overhead): Automated maintenance reporting with attribution. |
| FR34-B | Cleaning event frequency report | KPI-05 (Administrative overhead): Cleaning frequency tracking supports compliance auditing. |
| FR35-A | Staff headcount report | KPI-07 (Staff platform adoption): Staff headcount reports track active platform users. KPI-05 (Administrative overhead): Automated staff reporting. |
| FR35-B | Care event summary report | KPI-03 (Treatment compliance): Care event summaries enable compliance auditing. KPI-05 (Administrative overhead): Automated activity reporting. |
| FR36 | Shareable link activity log | KPI-05 (Administrative overhead): Automated logging replaces manual link tracking. KPI-06 (Adoption rate): Link activity data reveals adoption funnel engagement. |
| FR37 | User registration and authentication via Google SSO | KPI-07 (Operator engagement): SSO simplifies onboarding for multi-user scenarios in Phase 3, driving adoption. |
| FR38 | Shelter admin role assignment on creation | KPI-05 (Administrative overhead): Self-service shelter setup with automatic admin assignment reduces onboarding overhead. KPI-07 (Operator engagement). |
| FR39 | Staff invite link generation and redemption | KPI-05 (Administrative overhead): Streamlined staff onboarding via invite links. KPI-07 (Operator engagement): Frictionless joining flow for new staff. |
| FR40 | Role-based access control (Admin, Staff, Read-only) | KPI-07 (Operator engagement): Role clarity encourages confident multi-user usage. |

---

## 6. NFR → FR Coverage Summary

A reverse mapping showing which FRs are governed by each NFR.

| NFR ID | NFR Name | Governing FRs |
| :--- | :--- | :--- |
| NFR01 | Usability | FR01-A, FR01-B, FR01-C, FR02-A, FR02-B, FR02-C, FR03-A, FR03-B, FR04, FR05-A, FR05-B, FR06, FR08-A, FR08-C, FR11-A, FR11-B, FR11-C, FR11-D, FR11-F, FR12-A, FR12-B, FR12-C, FR13-B, FR15-A, FR15-B, FR15-C, FR15-D, FR19-A, FR19-B, FR21-A, FR21-B, FR22-A, FR22-B, FR22-C, FR28-A, FR30-A, FR30-B, FR30-C, FR31, FR32-A, FR32-B, FR32-C, FR33-A, FR33-B, FR34-A, FR34-B, FR35-A, FR35-B |
| NFR02 | Performance | FR05-A, FR07, FR11-A, FR12-A, FR12-C, FR13-A, FR15-A, FR19-A, FR21-A, FR22-A, FR30-A, FR30-B, FR30-C, FR31, FR32-A, FR32-B, FR32-C, FR33-A, FR33-B, FR34-A, FR34-B, FR35-A, FR35-B |
| NFR03 | Availability | *(Cross-cutting — applies to all FRs as a system-wide uptime target; no FR-specific mapping)* |
| NFR04 | Scalability | *(Cross-cutting — applies to all FRs as a system-wide capacity target; no FR-specific mapping)* |
| NFR05 | In-app Notification Reliability | FR17, FR18, FR20-A, FR20-B, FR23-A, FR24, FR25-A |
| NFR06 | Email/Push Notification Reliability | FR23-A, FR24, FR25-A |
| NFR07 | Access Control Enforcement | FR01-C, FR02-C, FR05-A, FR05-B, FR05-C, FR06, FR07, FR07-B, FR08-A, FR08-B, FR08-C, FR08-D, FR09, FR10-A, FR10-B, FR11-A, FR11-B, FR11-C, FR11-D, FR11-E, FR11-F, FR11-G, FR12-A, FR12-B, FR12-C, FR13-A, FR13-B, FR14, FR15-A, FR15-B, FR15-C, FR15-D, FR15-E, FR16, FR17, FR18, FR19-A, FR19-B, FR19-C, FR20-A, FR20-B, FR21-A, FR21-B, FR21-C, FR22-A, FR22-B, FR22-C, FR22-D, FR23-A, FR23-B, FR24, FR25-A, FR25-B, FR26-A, FR26-B, FR27, FR28-A, FR28-B, FR29, FR30-A, FR30-B, FR30-C, FR31, FR32-A, FR32-B, FR32-C, FR33-A, FR33-B, FR34-A, FR34-B, FR35-A, FR35-B, FR36, FR37, FR38, FR39, FR40 |
| NFR08 | Data Isolation | FR01-A, FR02-A, FR02-C, FR04, FR05-A, FR08-A, FR08-B, FR08-D, FR10-A, FR10-B, FR11-A, FR11-B, FR11-C, FR11-D, FR11-E, FR11-F, FR11-G, FR19-A, FR19-C, FR22-A, FR22-C, FR22-D, FR30-A, FR30-B, FR30-C, FR31, FR32-A, FR32-B, FR32-C, FR33-A, FR33-B, FR34-A, FR34-B, FR35-A, FR35-B, FR36, FR37, FR38, FR39, FR40 |
| NFR09 | Medical Data Privacy | FR05-A, FR07, FR07-B, FR09, FR10-A, FR10-B, FR12-A, FR12-C, FR13-A, FR14, FR15-A, FR15-D, FR15-E, FR16, FR26-B, FR27, FR28-A, FR28-B, FR29, FR32-B, FR35-A, FR36 |
| NFR10 | Link Anonymity | FR26-A, FR26-B, FR27, FR39 |
| NFR11 | Asset Protection | FR07, FR07-B, FR13-A, FR26-A, FR26-B |
| NFR12 | Link Integrity | FR26-A, FR26-B, FR27, FR28-A, FR28-B, FR29 |
| NFR13 | Audit Logging | FR01-C, FR05-A, FR05-B, FR05-C, FR06, FR07, FR07-B, FR08-A, FR08-B, FR08-D, FR09, FR10-A, FR10-B, FR11-B, FR11-C, FR11-D, FR11-E, FR11-F, FR11-G, FR12-A, FR12-C, FR13-A, FR14, FR15-A, FR15-B, FR15-C, FR15-D, FR15-E, FR16, FR19-A, FR19-B, FR19-C, FR20-A, FR20-B, FR21-A, FR21-B, FR21-C, FR22-A, FR22-B, FR22-C, FR22-D, FR23-A, FR23-B, FR25-A, FR25-B, FR26-A, FR26-B, FR27, FR28-A, FR28-B, FR29, FR36, FR37, FR38, FR39, FR40 |
| NFR14 | Notification Privacy | FR17, FR18, FR20-A, FR20-B, FR23-A, FR24 |
| NFR15 | Backup & Disaster Recovery | FR03-A, FR03-B, FR10-A, FR13-A |
| NFR16-A | Data Deletion Request Workflow | FR08-A, FR08-B, FR09, FR14 |
| NFR16-B | Audit Log Tombstoning | FR08-A, FR08-B, FR09, FR14 |
| NFR17 | Global Search | FR05-A, FR11-A, FR19-A, FR22-A, FR30-A, FR30-B, FR30-C |

---

## 7. FR → Test Case Mapping

This table maps each Functional Requirement to its corresponding QA/Test Case IDs. Test Cases are derived directly from the Acceptance Criteria outlined in the PRD (where each atomic scenario forms the basis of a test case).

| FR ID | FR Name | Associated Test Cases |
| :--- | :--- | :--- |
| FR01-A | Local operator profile creation | TC-FR01A-01 (Successful Local Registration), TC-FR01A-02 (Incomplete Profile Rejected — Empty Name), TC-FR01A-03 (Invalid Email Format Rejected) |
| FR01-B | Returning operator auto-access | TC-FR01B-01 (Returning Operator Auto-Access), TC-FR01B-02 (Corrupted Profile Treated as First-Time) |
| FR01-C | Local operator profile edit | TC-FR01C-01 (Edit Profile Successfully), TC-FR01C-02 (Clear Required Field on Edit Prevented) |
| FR02-A | Local shelter creation | TC-FR02A-01 (Valid Local Shelter Creation), TC-FR02A-02 (Duplicate Shelter Name Allowed), TC-FR02A-03 (New Shelter Set as Active Context) |
| FR02-B | Local shelter edit | TC-FR02B-01 (Edit Shelter Details Successfully), TC-FR02B-02 (Clear Required Field on Edit Prevented) |
| FR02-C | Local shelter deletion/close | TC-FR02C-01 (Close Empty Shelter), TC-FR02C-02 (Close Shelter with Active Pets Blocked), TC-FR02C-03 (Close Shelter with Only Archived Pets) |
| FR03-A | Local data export for a single shelter | TC-FR03A-01 (Single Shelter Export), TC-FR03A-02 (Large Data Export Completion), TC-FR03A-03 (Insufficient Storage Error) |
| FR03-B | Local data export for all shelters | TC-FR03B-01 (All Shelters Export), TC-FR03B-02 (Insufficient Storage Error) |
| FR04 | Single-user shelter context switching | TC-FR04-01 (Switch Active Shelter), TC-FR04-02 (Data Scoping After Switch), TC-FR04-03 (Unsaved Changes Warning) |
| FR05-A | Pet profile creation | TC-FR05A-01 (Create Profile with All Fields), TC-FR05A-02 (Estimated DOB Flag), TC-FR05A-03 (Intake Origin Other with Free Text), TC-FR05A-04 (Missing Required Field Prevented) |
| FR05-B | Pet profile edit | TC-FR05B-01 (Edit Profile Successfully), TC-FR05B-02 (Clear Required Field on Edit Prevented), TC-FR05B-03 (Duplicate Name on Edit Allowed) |
| FR05-C | Pet profile hard deletion | TC-FR05C-01 (Hard Delete with Confirmation), TC-FR05C-02 (Hard Delete Cancelled), TC-FR05C-03 (Hard Delete on Archived Pet Blocked) |
| FR06 | Adoption availability flag toggle | TC-FR06-01 (Toggle On/Off), TC-FR06-02 (Auto-clear on Archival) |
| FR07 | Pet media upload (photos/videos) | TC-FR07-01 (Valid Upload), TC-FR07-02 (Upload Failure/Abort), TC-FR07-03 (File Exceeding Size Limit Rejected) |
| FR07-B | Pet media deletion | TC-FR07B-01 (Delete Media with Confirmation), TC-FR07B-02 (Cancel Deletion Leaves Media Unchanged) |
| FR08-A | Set outcome to Deceased | TC-FR08A-01 (Set Outcome to Deceased), TC-FR08A-02 (Pending Events Auto-Cancelled on Archival), TC-FR08A-03 (Adoption Flag Cleared on Archival) |
| FR08-B | Set outcome to Transferred (External) | TC-FR08B-01 (Set Outcome to Transferred External), TC-FR08B-02 (Full History Preserved at Originating Shelter) |
| FR08-C | Set outcome to In Foster | TC-FR08C-01 (Set Outcome to In Foster), TC-FR08C-02 (Clear In Foster Status Returns to Active) |
| FR08-D | Pet archival side-effects | TC-FR08D-01 (Care Events Cancelled on Archival), TC-FR08D-02 (Shareable Links Revoked on Archival), TC-FR08D-03 (No Side-Effects for In Foster) |
| FR09 | Adopter details capture on adoption | TC-FR09-01 (Submit Valid Adopter Form), TC-FR09-02 (Submit Incomplete Adopter Form Blocked) |
| FR10-A | Shadow record creation for internal transfers | TC-FR10A-01 (Valid Internal Transfer), TC-FR10A-02 (Transfer to Closed Shelter Blocked), TC-FR10A-03 (Link Revocation on Transfer), TC-FR10A-04 (Shadow Record Read-Only) |
| FR10-B | Migration of active treatments and care events on internal transfer | TC-FR10B-01 (Treatments and Events Migrated on Transfer), TC-FR10B-02 (No Migration When None Active) |
| FR11-A | Veterinary directory search and filtering | TC-FR11A-01 (Search Directory by Clinic Name), TC-FR11A-02 (Empty Search Results Displayed) |
| FR11-B | Add veterinary clinic to directory | TC-FR11B-01 (Add Valid Clinic), TC-FR11B-02 (Duplicate Clinic Name Warning), TC-FR11B-03 (Empty Clinic Name Prevented) |
| FR11-C | Add veterinarian to directory | TC-FR11C-01 (Add Vet Linked to Clinic), TC-FR11C-02 (Add Vet Without Clinic Selected Prevented) |
| FR11-D | Edit veterinary clinic in directory | TC-FR11D-01 (Edit Clinic Successfully), TC-FR11D-02 (Clear Required Field Prevented) |
| FR11-E | Soft-delete veterinary clinic from directory | TC-FR11E-01 (Delete Unreferenced Clinic), TC-FR11E-02 (Soft-Delete Referenced Clinic) |
| FR11-F | Edit veterinarian in directory | TC-FR11F-01 (Edit Vet Successfully), TC-FR11F-02 (Clear Required Field Prevented) |
| FR11-G | Soft-delete veterinarian from directory | TC-FR11G-01 (Delete Unreferenced Vet), TC-FR11G-02 (Soft-Delete Referenced Vet) |
| FR12-A | Veterinary appointment logging | TC-FR12A-01 (Log Upcoming Appointment), TC-FR12A-02 (Empty Notes Field Prevented) |
| FR12-B | Retroactive appointment date warning | TC-FR12B-01 (Retroactive Appointment Confirmed), TC-FR12B-02 (Retroactive Appointment Cancelled) |
| FR12-C | Edit veterinary appointment | TC-FR12C-01 (Edit Appointment Successfully), TC-FR12C-02 (Retroactive Date Warning on Edit) |
| FR13-A | Veterinary document upload | TC-FR13A-01 (Valid PDF Upload), TC-FR13A-02 (Multiple Image Uploads), TC-FR13A-03 (Upload Failure/Abort) |
| FR13-B | Unsupported file type rejection | TC-FR13B-01 (DOCX Upload Rejected), TC-FR13B-02 (EXE Upload Rejected) |
| FR14 | Appointment soft delete with reference preservation | TC-FR14-01 (Soft Delete Independent), TC-FR14-02 (Soft Delete Linked — Placeholder Text Shown) |
| FR15-A | Care event creation | TC-FR15A-01 (Create Care Event with All Fields), TC-FR15A-02 (Optional Substance Field), TC-FR15A-03 (Empty Modality Prevented), TC-FR15A-04 (Past Date Requires Confirmation) |
| FR15-B | Recurring care event scheduling | TC-FR15B-01 (Create Recurring Event), TC-FR15B-02 (Cancel Recurring Event) |
| FR15-C | Temporary care event with end date | TC-FR15C-01 (Create Temporary Event with End Date), TC-FR15C-02 (End Date in Past Requires Confirmation) |
| FR15-D | Edit care event | TC-FR15D-01 (Edit Care Event Successfully), TC-FR15D-02 (Edit Recurring — Future Only Updated) |
| FR15-E | Delete care event | TC-FR15E-01 (Delete Single Event), TC-FR15E-02 (Cancel All Future Recurring Occurrences) |
| FR16 | Care event and appointment optional linking | TC-FR16-01 (Link Creation from Appointment), TC-FR16-02 (Manual Link Creation), TC-FR16-03 (Placeholder on Soft-Deleted Appointment) |
| FR17 | Care event due-date in-app notification | TC-FR17-01 (Due Date Trigger Notification) |
| FR18 | Proactive care event reminders (7, 3, 1 day before) | TC-FR18-01 (Standard Trigger — 7/3/1 Day Reminders), TC-FR18-02 (Short Lead Time Trigger — Skips Inapplicable Reminders) |
| FR19-A | Inventory item creation | TC-FR19A-01 (Create Valid Inventory Item), TC-FR19A-02 (Empty Name Prevented), TC-FR19A-03 (Past Purchase Date Warning), TC-FR19A-04 (Past Expiration Date Warning/Rejection) |
| FR19-B | Inventory quantity adjustment | TC-FR19B-01 (Adjust Quantity Successfully), TC-FR19B-02 (Negative Quantity Prevented) |
| FR19-C | Delete inventory item | TC-FR19C-01 (Delete Item with Confirmation), TC-FR19C-02 (Delete Item with Active Alerts Removed) |
| FR20-A | Quantity threshold alert rule | TC-FR20A-01 (Set Threshold and Trigger Alert), TC-FR20A-02 (Threshold of 0 Disables Alert) |
| FR20-B | Expiration window alert rule | TC-FR20B-01 (Set Warning Window and Trigger Alert), TC-FR20B-02 (Window of 0 Disables Alert) |
| FR21-A | Inventory usage template decrement from care events | TC-FR21A-01 (Execute Template Decrement), TC-FR21A-02 (Care Event Without Inventory Link) |
| FR21-B | Insufficient stock handling on template decrement | TC-FR21B-01 (Insufficient Stock Warning Displayed), TC-FR21B-02 (Care Event Saved Without Inventory Link) |
| FR21-C | Inventory adjustment reversal with audit tracking | TC-FR21C-01 (Reverse Accidental Decrement), TC-FR21C-02 (Audit Log Shows All Adjustments) |
| FR22-A | Single maintenance task creation | TC-FR22A-01 (Create Valid Task), TC-FR22A-02 (Assign Task to Staff), TC-FR22A-03 (Empty Description Prevented), TC-FR22A-04 (Past Scheduled Date Requires Confirmation) |
| FR22-B | Recurring maintenance task creation | TC-FR22B-01 (Create Recurring Task), TC-FR22B-02 (Future Occurrences Inherit Assignee) |
| FR22-C | Edit maintenance task | TC-FR22C-01 (Edit Task Successfully), TC-FR22C-02 (Propagate Edit to Future Occurrences) |
| FR22-D | Delete/cancel maintenance task | TC-FR22D-01 (Delete Single Task), TC-FR22D-02 (Cancel Future Recurring Occurrences) |
| FR23-A | Maintenance task notifications | TC-FR23A-01 (Notification on Task Creation), TC-FR23A-02 (Overdue Task Reminders Continue) |
| FR23-B | Maintenance task completion tracking | TC-FR23B-01 (Complete Task with Timestamp and Attribution), TC-FR23B-02 (Completed Task Details Displayed) |
| FR24 | Two-tier notification delivery (Standard in-app + Custom email/push) | TC-FR24-01 (In-App Delivery Only), TC-FR24-02 (Custom Mode with Email and Push) |
| FR25-A | Notification delivery status tracking and retry | TC-FR25A-01 (Successful Retry on Second Attempt), TC-FR25A-02 (3-Retry Failure Escalation — Flagged FAILED) |
| FR25-B | Auto-suppression and failure banner | TC-FR25B-01 (Auto-Suppression After 3 Failures), TC-FR25B-02 (Acknowledge Banner Re-Enables Channel), TC-FR25B-03 (Admin Manually Re-Enables Suppressed Channel) |
| FR26-A | Adoption Profile link generation | TC-FR26A-01 (Generate Adoption Link for Available Pet), TC-FR26A-02 (Access Adoption Link Without Auth), TC-FR26A-03 (Expired/Revoked Link Returns Denial) |
| FR26-B | Veterinary Profile link generation | TC-FR26B-01 (Generate Veterinary Link), TC-FR26B-02 (Access Vet Link Without Auth), TC-FR26B-03 (Expired/Revoked Link Returns Denial) |
| FR27 | Configurable link TTL (max 90 days, renewable, no permanent option) | TC-FR27-01 (Set TTL and Expire), TC-FR27-02 (Renew Link), TC-FR27-03 (TTL Exceeding Maximum Rejected) |
| FR28-A | Adoption Profile link generation restriction | TC-FR28A-01 (Generate for Available Pet), TC-FR28A-02 (Deny for Not Available Pet) |
| FR28-B | Shareable link prohibition for archived pets | TC-FR28B-01 (Block Link Creation for Archived Pet), TC-FR28B-02 (Auto-Revocation on Archival) |
| FR29 | Manual link revocation | TC-FR29-01 (Revoke Active Link), TC-FR29-02 (Access Revoked Link Returns Denial), TC-FR29-03 (Attempt to Revoke Already-Inactive Link) |
| FR30-A | Pet search and filtering | TC-FR30A-01 (Search Pets by Species), TC-FR30A-02 (Filter by Adoption Availability), TC-FR30A-03 (Empty Search Results Displayed) |
| FR30-B | Inventory search and filtering | TC-FR30B-01 (Search Inventory by Category), TC-FR30B-02 (Filter by Alert Status), TC-FR30B-03 (Empty Search Results Displayed) |
| FR30-C | Maintenance task search and filtering | TC-FR30C-01 (Filter Tasks by Status), TC-FR30C-02 (Search Tasks by Type), TC-FR30C-03 (Empty Search Results Displayed) |
| FR31 | Per-shelter dashboard overview | TC-FR31-01 (View Dashboard with Live KPIs), TC-FR31-02 (Auto-refresh Stale Data), TC-FR31-03 (Active Pet Count Decreases on Archival) |
| FR32-A | Pet census report | TC-FR32A-01 (Generate Census Report), TC-FR32A-02 (Empty State When No Active Pets) |
| FR32-B | Archived pet log report | TC-FR32B-01 (Generate Adopted Pet Log with Adopter Details), TC-FR32B-02 (Generate Deceased Pet Log Without Adopter Details) |
| FR32-C | Treatment list report | TC-FR32C-01 (Generate Treatment List Report), TC-FR32C-02 (Empty State When No Active Treatments) |
| FR33-A | Inventory status report | TC-FR33A-01 (Generate Status Report with Highlights), TC-FR33A-02 (All Items Included from Current Shelter) |
| FR33-B | Inventory alert history report | TC-FR33B-01 (Generate Alert History Report), TC-FR33B-02 (Empty State When No Alerts in Range) |
| FR34-A | Maintenance task status report | TC-FR34A-01 (Generate Task Status Report with Attribution), TC-FR34A-02 (Tasks Scoped to Current Shelter) |
| FR34-B | Cleaning event frequency report | TC-FR34B-01 (Generate Cleaning Frequency Report), TC-FR34B-02 (Count of 0 When No Cleaning Tasks in Range) |
| FR35-A | Staff headcount report | TC-FR35A-01 (Generate Staff Headcount Report as Admin), TC-FR35A-02 (Staff Access Denied) |
| FR35-B | Care event summary report | TC-FR35B-01 (Generate Care Event Summary), TC-FR35B-02 (Counts of 0 When No Events in Range) |
| FR36 | Shareable link activity log | TC-FR36-01 (View Link Activity Log as Admin), TC-FR36-02 (Staff Access to Another Shelter's Log Denied) |
| FR37 | User registration and authentication via Google SSO | TC-FR37-01 (New User SSO), TC-FR37-02 (Returning User SSO), TC-FR37-03 (SSO Provider Unavailable Error) |
| FR38 | Shelter admin role assignment on creation | TC-FR38-01 (Admin Role Assigned on Shelter Creation), TC-FR38-02 (Duplicate Shelter Name Allowed) |
| FR39 | Staff invite link generation and redemption | TC-FR39-01 (Generate Invite Link), TC-FR39-02 (Redeem Invite Link with Matching Email), TC-FR39-03 (Email Mismatch Rejects Redemption), TC-FR39-04 (Expired Invite Link Error), TC-FR39-05 (Resend Invalidates Previous) |
| FR40 | Role-based access control (Admin, Staff, Read-only) | TC-FR40-01 (Role Enforcement — Write Access), TC-FR40-02 (Role Enforcement — Admin-Only Actions), TC-FR40-03 (Last Admin Cannot Be Removed) |

