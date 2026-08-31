# Business Requirement Document: Luna's Pet Central

**Project Details**:


| Field            | Value                                                                                                                                                                                           |
| :---------------- | :----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Project Name** | Luna's Pet Central                                                                                                                                                                              |
| **Creator**      | Helder Souza                                                                                                                                                                                    |
| **Email**        | [hellder.souza@proton.me](mailto:hellder.souza@proton.me)                                                                                                                                       |
| **Document No.** | BRD-LPC-001                                                                                                                                                                                     |
| **Date**         | 2026-08-28                                                                                                                                                                                      |
| **Last Updated** | 2026-08-30 — Phase annotations added to In-Scope, Proposed Process, and KPIs; glossary corrected (In Foster removed from Archived Pet); NFR02 remarks phase-scoped; Future items annotated; terminology note added |
| **Version**      | 3.2                                                                                                                                                                                             |


---

## 1. Executive Summary Snapshot

Luna's Pet Central is an offline-first, single-user shelter operations management tool designed for fast hypothesis validation on a single device. The platform enables a single operator to manage multiple local shelter profiles, providing end-to-end digital management of pet records, medical history, inventory, and facility maintenance.

The single operator creates a local profile (name, contact/email) with no third-party login required. One operator manages multiple shelter profiles locally. The system provides full data export capability for future migration. The pet lifecycle has been expanded to include an "In Foster" status alongside Adopted, Deceased, and Transferred outcomes, with mandatory adopter details capture upon adoption.

**Goal / Purpose of this BRD**: To formally document the business requirements for the development of the offline-first MVP of Luna's Pet Central so that all stakeholders have a clear, agreed-upon foundation for the project.

**Target Audience**: Project sponsor (Helder Souza), development team, and the single shelter operator involved in the delivery and use of this platform.

---

## 2. Project Description

### Purpose

Animal shelters currently rely on fragmented, manual processes for managing critical operational data. Veterinary records arrive from external professionals in the form of physical papers, printed PDFs, and image files — none of which are systematically organized or queryable. Pet registration, care scheduling, and stock management are handled informally.

Luna's Pet Central will replace these ad-hoc methods with a structured, centralized platform where all shelter data is recorded, tracked, and accessible to authorized personnel. The platform introduces proactive care event reminders, inventory usage templates for streamlined stock management, and a robust notification system with failure escalation — all designed to reduce manual overhead and improve the quality of animal care.

### Current Process / Solution

There is no unified digital system in place. Vet appointment data is received from external medical professionals as paper documents, images, and PDF files. Pet care events (vaccines, deworming, treatments) are tracked manually or not tracked at all. Inventory of supplies is managed informally without alerts. Maintenance and cleaning schedules depend on individual staff memory or verbal communication.

### Challenges

- Inability to query or report on historical pet care data.
- Risk of lost or damaged paper-based medical records.
- No visibility into inventory levels or expiration dates until shortages occur.
- No structured mechanism for sharing pet information with veterinarians or adoption candidates.
- No scalable approach to managing more than one shelter simultaneously.
- No tracking of pet lifecycle outcomes (adoption, death, transfer, foster placement).
- No centralized authentication or staff onboarding workflow.

### Reasons for Undertaking the Project

The project is driven by the need to professionalize shelter operations, improve the quality of animal care through reliable record-keeping, and enable the shelter network to grow from a single location to multiple locations without operational breakdown.

---

## 3. Project Scope

### In-Scope

- **Local Operator Profile**: Single-user registration with basic profile data (name, contact/email) stored locally on the device. No dependency on external authentication services. Access is immediate and offline.
- **Data Export**: Complete local data export capability allowing the operator to extract all shelter records for backup or future migration to online versions.
- **Single-User Operation**: All operations performed by one operator on one device. Multi-user access control is deferred to the online phase.
- **Multi-Shelter Management**: The operator can create, manage, and switch between multiple local shelter profiles on a single device. Each shelter maintains independent data.
- **Pet Registration**: Complete pet profile creation with all relevant demographic and health data, including intake origin, adoption availability flag, and an estimated date-of-birth flag for animals with unknown birthdates.
- **Pet Lifecycle Management**: Distinct outcome statuses — Adopted, Deceased, Transferred, and In Foster — that archive the pet and preserve full history. Adoption requires capturing adopter details (Name, Phone, Address).
- **Internal Transfer Shadow Records**: When a pet is transferred between shelters within the platform, a read-only shadow record is created in the receiving shelter linking back to the original record. The transfer migrates all active treatments to the receiving shelter. *(Future — v2.0+)*
- **Pet Media**: Photos and videos uploadable to pet profiles.
- **Veterinary Clinic &amp; Professional Directory**: A searchable directory of clinics and veterinarians, reusable across appointments.
- **Veterinary Appointment Tracking**: Logging appointments with clinic/hospital and veterinarian selected from the directory, including document uploads (PDF, images). Appointments support soft delete with preservation of any linked care event references. *(Future — v2.0+)*
- **Pet Care Tracking**: Scheduling and recording of recurring care events including vaccines, vermifuge treatments, and temporary medications. Care events can be optionally linked to a vet appointment.
- **Proactive Care Event Reminders**: *(Phase 4)* In-app reminders sent 7, 3, and 1 day before a care event's due date.
- **Inventory / Stock Management**: *(Phase 2)* Categorized tracking of all shelter consumables with quantity, units, purchase date, and expiration date fields.
- **Dynamic Inventory Alerts**: *(Phase 2)* Configurable notifications triggered by low stock thresholds and approaching expiration dates.
- **Inventory Usage Templates**: *(Phase 2)* Pre-configured templates enabling 1-click inventory decrement directly from care event recording.
- **Maintenance Scheduling**: *(Phase 2)* Creation and tracking of maintenance tasks with optional staff assignment and notifications.
- **Notification System**: Basic local in-app notifications only for reminders and alerts.
- **Search and Filtering**: *(Phase 4)* Search across pets and inventory; filter maintenance tasks by type and status.
- **Reporting and Dashboards**: *(Phase 4)* Summary views covering active pet counts, staff counts, care activity, inventory status, and maintenance history.
- **Data Deletion (GDPR)**: *(Phase 3+)* Support for GDPR data deletion requests featuring a 7-day cooling-off period before hard deletion, during which the requesting Admin may cancel the deletion request with a single click, restoring the data, utilizing "Tombstoning" to replace PII in immutable audit logs.

### Out-of-Scope

- Online adoption payment processing.
- Public-facing donation management or fundraising tools.
- Volunteer shift scheduling or volunteer management.
- Any direct integration with external veterinary clinic management systems (for MVP).
- Financial accounting or billing features.
- Global platform administrator role.
- WCAG accessibility compliance (planned for future assessment).
- Localization / multi-language support.
- Shareable Pet Profiles (deferred to online phase).
- Two-Tier Notification and failure escalation (deferred to online phase).
- Google SSO &amp; cloud authentication (deferred).
- Multi-user collaboration &amp; RBAC (deferred).
- Staff invite links (deferred).
- External shareable links (deferred).
- Email/push notification delivery (deferred).

---

## 4. Business Drivers


| Driver                                  | Description                                                                                                                                           |
| :--------------------------------------- | :----------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Operational Efficiency**              | Replace fragmented manual workflows with a single digital source of truth, reducing time spent searching for records and coordinating verbally.       |
| **Improved Animal Care Quality**        | Structured tracking of treatment schedules, vaccines, and medical history — with proactive reminders — ensures no animal misses critical care events. |
| **Inventory Waste Reduction**           | Proactive alerts for low stock and upcoming product expiration reduce waste and prevent shortages of critical supplies.                               |
| **Organizational Scalability**          | A platform designed for multi-shelter management allows the organization to scale operations without proportionally scaling administrative overhead.  |
| **Data Accessibility and Transparency** | Enabling secure, controlled sharing of pet data with veterinarians and adoption candidates improves outcomes and trust.                               |
| **Risk Mitigation**                     | Digitizing physical paper records reduces the risk of losing critical medical history in the event of fire, flooding, or misplacement.                |
| **Pet Lifecycle Traceability**          | Tracking adoption, death, transfer, and foster outcomes provides complete traceability and enables accurate reporting on shelter throughput.          |


---

## 5. Business Success Criteria


| KPI ID | KPI                                     | Target                                                               | Measurement Window             |
| :------ | :--------------------------------------- | :-------------------------------------------------------------------- | :------------------------------ |
| KPI-01 | Time to retrieve a pet's medical record | Reduce from 10+ minutes to under 30 seconds                          | Post-deployment                |
| KPI-02 | Expired inventory waste                 | Reduce by 80%                                                        | Within 6 months of deployment  |
| KPI-03 | Treatment compliance rate               | Achieve 95% compliance through proactive reminders                   | Within 6 months of deployment  |
| KPI-04 | Lost medical records                    | Zero lost records                                                    | Post-deployment                |
| KPI-05 | Administrative overhead                 | Reduce by 40% through digital workflows                              | Within 6 months of deployment  |
| KPI-06 | Adoption rate                           | Increase by 15% — Phase 1: measured via adoption flag usage and adopter details capture; Phase 3+: additionally measured via shareable adoption profile engagement | Within 12 months of deployment |
| KPI-07 | Operator engagement                     | Single operator actively using the tool for daily shelter operations | Within 2 weeks of first use    |


---

## 6. User Personas

### Shelter Operator


| Attribute       | Detail                                                                             |
| :--------------- | :---------------------------------------------------------------------------------- |
| **Role**        | Creates and manages shelters locally on a single device                            |
| **Goals**       | Manage shelter operations, monitor dashboard, export data                          |
| **Pain Points** | Scattered information across paper records, no visibility into shelter performance |


### Shelter Staff

*Note: Deferred to online multi-user phase (Phase 3+).*


| Attribute       | Detail                                                                                                                  |
| :--------------- | :----------------------------------------------------------------------------------------------------------------------- |
| **Role**        | Day-to-day operational user responsible for pet care and shelter upkeep                                                 |
| **Goals**       | Register pets, administer and log care events, update inventory, manage maintenance tasks                               |
| **Pain Points** | Repetitive manual data entry, forgotten care schedules, no stock level visibility, no reminders for upcoming treatments |


### Veterinarian (External via Shareable Link)

*Note: Access via shareable links is deferred.*


| Attribute       | Detail                                                                                            |
| :--------------- | :------------------------------------------------------------------------------------------------- |
| **Role**        | External medical professional consulting on a pet's health                                        |
| **Goals**       | Consult pet medical history, review treatment records and uploaded documents                      |
| **Pain Points** | Incomplete or delayed records, no centralized view of a pet's history, reliance on paper handoffs |


### Adopter (External via Shareable Link)

*Note: Access via shareable links is deferred.*


| Attribute       | Detail                                                                            |
| :--------------- | :--------------------------------------------------------------------------------- |
| **Role**        | Prospective pet adopter browsing available animals                                |
| **Goals**       | Evaluate available pets, view photos/videos and demographic information           |
| **Pain Points** | Limited information about available pets, no easy way to browse profiles remotely |


---

## 7. Present Process

The current operational process at the shelter is largely informal and paper-based:

1. **Pet Intake**: When a new animal arrives, basic information may be noted on paper, but there is no standardized intake form or digital record. The animal's origin is not formally recorded.
2. **Veterinary Appointments**: Appointments are booked externally. Veterinary results and records are received back as physical documents (paper, printed PDFs, scanned images) and stored in physical folders with no consistent filing system.
3. **Pet Care Events**: Vaccines, deworming, and medication schedules are tracked on paper or by memory. There is no automated reminder or recurring schedule system.
4. **Inventory**: Supplies such as food, medications, and cleaning products are managed by visual inspection. There is no formal tracking of quantities, purchase dates, or expiration dates.
5. **Maintenance**: Cleaning and repair needs are communicated verbally between staff. There is no scheduling, assignment, or completion-tracking system.
6. **Information Sharing**: Sharing a pet profile with a veterinarian or potential adopter requires manually preparing a summary or handing over physical documents.
7. **Pet Outcomes**: There is no structured record of a pet being adopted, deceased, transferred, or placed in foster care. Data is lost or left unresolved.

> **Note on User Journey**: Currently, there is no structured user journey — staff rely on memory and verbal communication to coordinate daily operations.

---

## 8. Proposed Process

The proposed process through Luna's Pet Central establishes a fully digital workflow:

1. **Pet Intake**: Staff create a structured pet profile capturing all required fields including intake origin (Street Rescue, Owner Surrender, Transfer, Born at Shelter, Other). An estimated date-of-birth flag is available for animals with unknown birthdates. The adoption availability flag is toggled at intake or later.
2. **Veterinary Appointments**: Staff log appointments by selecting the clinic and veterinarian from the directory (or adding a new entry). Veterinary documents are uploaded and attached. Care events can be created directly from the appointment record and are linked informally. Appointments can be soft-deleted while preserving any linked care event references.
3. **Pet Care Events**: The system maintains scheduled care events (vaccines, vermifuge, medications). Staff record each administered treatment including modality, substance name (optional), frequency/recurrence, and treatment details. Proactive in-app reminders fire 7, 3, and 1 day before a care event is due, in addition to the standard due-date notification. Care events can optionally reference a vet appointment.
4. **Inventory**: All items are logged in categorized inventory with quantity, unit of measure, purchase date, and expiration date. Alert thresholds are configured per item with Standard (in-app) or Custom (email and/or push) notification modes *(Custom mode: Phase 2+)*. Staff adjust stock levels as items are consumed, with inventory usage templates enabling 1-click decrement directly from care event recording.
5. **Maintenance**: Maintenance tasks are created, optionally assigned to a specific staff member, and scheduled. All staff (and the assignee) receive notifications. *(Phase 2+)* Completion is logged.
6. **Information Sharing**: *(Phase 3+)* Staff generate a shareable link for a specific pet with a configurable TTL (maximum 90 days, renewable). Two link types govern visibility. Links can be manually revoked at any time, and are auto-revoked when a pet is archived.
7. **Pet Outcomes**: When a pet is adopted, deceased, transferred, or placed in foster care, staff update the outcome status. Adoption requires capturing adopter details (Name, Phone, Address). Transfers simply archive the pet. The pet is archived — full history preserved, removed from active dashboards. Auto-cancel pending care events, clear adoption availability flag.
8. **Authentication**: The operator creates a local profile with name and contact details. No external login required. The operator accesses the tool directly on their device.
9. **Data Deletion &amp; Retention**: *(Phase 3+)* Records are kept indefinitely unless a GDPR deletion request is submitted. Deletion undergoes a 7-day cooling-off period before hard deletion, during which the requesting Admin may cancel the request with a single click, restoring the data. PII in immutable audit logs undergoes Tombstoning.

> **Terminology Note**: In Phase 1 (offline MVP), all references to "Staff" in the proposed process above refer to the single **Operator** managing shelters locally on one device. Multi-user staff operations are introduced from Phase 3 onward.

---

## 9. MVP Definition

### MVP (Phase 1 — Offline Validation)

- Local operator profile registration (name, contact/email) with offline access
- Local shelter creation and multi-shelter management on a single device
- Shelter context switching
- Data export for portability and future migration
- Pet registration and profile management (including estimated DOB flag, intake origin with 'Other' + detail, health status/conditions, photo/video media capture, adoption availability flag)
- Pet lifecycle management (Active, In Foster, Adopted, Deceased, Transferred - External) with mandatory adopter details capture on adoption
- Archival side-effects: auto-cancel pending care events, clear adoption availability flag
- Veterinary clinic and professional directory (shelter-scoped)
- Veterinary appointment logging (with retroactive date warning) and document upload
- Care event recording and scheduling with recurrence intervals
- Optional bidirectional linking between care events and appointments
- Local in-app due-date alerts for care events

### Phase 2 (v1.1 — Operational Enrichment)

- Inventory management with categorized tracking
- Per-item inventory alert rules and notifications
- Inventory usage templates (1-click decrement from care events)
- Maintenance task scheduling, assignment, and tracking
- Two-tier notification delivery system (Standard + Custom)
- Notification failure escalation (in-app banner after 3 retries)

### Phase 3 (v1.2 — Online Foundation)

- User authentication via Google SSO (replacing local profile for cloud access)
- Multi-user support with cloud identity
- Staff invite link generation and redemption (identity-bound)
- Role-based access control (Admin, Staff, Read-only)
- Shareable pet profile link generation (Adoption + Veterinary)
- Configurable TTL (max 90 days, renewable)
- Link revocation and activity logging

### Phase 4 (v1.3 — Reporting &amp; Discovery)

- Proactive care event reminders (7, 3, and 1 day before due date)
- Dashboard and reporting module
- Pet reports (census, archived log, treatment list)
- Inventory reports (status, alert history)
- Maintenance reports (scheduled, completed, overdue)
- Staff and care event reports
- Shareable link activity log
- Search and filtering across all entities

### Future (v2.0+)

- Advanced analytics and trend reporting
- Internal transfer shadow records
- Appointment soft delete

---

## 10. Functional Requirements


| PRD ID | Requirement                                                                                                                           | Phase         | Priority | Raised By    |
| :------ | :------------------------------------------------------------------------------------------------------------------------------------- | :------------- | :-------- | :------------ |
| FR01-A | Local operator profile creation — first-time registration with name/contact/email, local storage, immediate access.                   | Phase 1 (MVP) | 1        | Helder Souza |
| FR01-B | Returning operator auto-access — existing profile loaded from local storage without login.                                            | Phase 1 (MVP) | 1        | Helder Souza |
| FR01-C | Local operator profile edit — update name/contact/email at any time.                                                                  | Phase 1 (MVP) | 1        | Helder Souza |
| FR02-A | Local shelter creation — form with required name + optional details, auto-sets as active context, duplicate names allowed.            | Phase 1 (MVP) | 1        | Helder Souza |
| FR02-B | Local shelter edit — update name/details at any time.                                                                                 | Phase 1 (MVP) | 1        | Helder Souza |
| FR02-C | Local shelter deletion/close — closure blocked if active pets exist; closed shelters preserved in read-only mode.                     | Phase 1 (MVP) | 1        | Helder Souza |
| FR03-A | Single-shelter data export — portable format for one shelter, local save location chosen by operator.                                 | Phase 1 (MVP) | 1        | Helder Souza |
| FR03-B | All-shelters data export — single portable export from every shelter on device.                                                       | Phase 1 (MVP) | 1        | Helder Souza |
| FR04   | Single-user shelter context switching — all operations scoped to active shelter, switch via selector.                                 | Phase 1 (MVP) | 1        | Helder Souza |
| FR05-A | Pet profile creation — required fields with validation, estimated DOB flag, intake origin 'Other' + free text.                        | Phase 1 (MVP) | 1        | Helder Souza |
| FR05-B | Pet profile edit — update any field, same validation as create, duplicate names allowed.                                              | Phase 1 (MVP) | 1        | Helder Souza |
| FR05-C | Pet profile hard deletion — permanent removal with confirmation, distinct from archival (FR08).                                       | Phase 1 (MVP) | 2        | Helder Souza |
| FR06   | Adoption availability flag toggle — boolean flag, auto-cleared on archival.                                                           | Phase 1 (MVP) | 1        | Helder Souza |
| FR07   | Pet media upload — photos/videos to pet profile, size limit validation.                                                               | Phase 1 (MVP) | 2        | Helder Souza |
| FR08-A | Set outcome to Deceased — archives pet, preserves history, removes from active views.                                                 | Phase 1 (MVP) | 1        | Helder Souza |
| FR08-B | Set outcome to Transferred (External) — archives pet, no shadow record.                                                               | Phase 1 (MVP) | 1        | Helder Souza |
| FR08-C | Set outcome to In Foster — non-archived reversible status, pet remains in active list.                                                | Phase 1 (MVP) | 1        | Helder Souza |
| FR08-D | Pet archival side-effects — auto-cancel care events, clear adoption flag, revoke shareable links.                                     | Phase 1 (MVP) | 1        | Helder Souza |
| FR09   | Adopter details capture on adoption — Name, Phone, Address required before completing archival.                                       | Phase 1 (MVP) | 1        | Helder Souza |
| FR10-A | Shadow record creation for internal transfers — read-only copy at origin, new active profile at destination.                          | Future        | 2        | Helder Souza |
| FR10-B | Migration of active treatments and care events on internal transfer — preserves care continuity.                                      | Future        | 2        | Helder Souza |
| FR11-A | Veterinary directory search and filtering — search by clinic name, shelter-scoped.                                                    | Phase 1 (MVP) | 1        | Helder Souza |
| FR11-B | Add veterinary clinic to directory — clinic name, address, contact details.                                                           | Phase 1 (MVP) | 1        | Helder Souza |
| FR11-C | Add veterinarian to directory — vet name, specialization, contact, linked to clinic.                                                  | Phase 1 (MVP) | 1        | Helder Souza |
| FR12-A | Veterinary appointment logging — select clinic/vet, date, notes, chronological display.                                               | Phase 1 (MVP) | 1        | Helder Souza |
| FR12-B | Retroactive appointment date warning — confirmation required for past dates.                                                          | Phase 1 (MVP) | 1        | Helder Souza |
| FR13-A | Veterinary document upload — PDF/JPEG/PNG to appointments, multiple files supported.                                                  | Phase 1 (MVP) | 1        | Helder Souza |
| FR13-B | Unsupported file type rejection — descriptive error for non-PDF/image uploads.                                                        | Phase 1 (MVP) | 1        | Helder Souza |
| FR14   | Appointment soft delete with reference preservation — placeholder for linked care events.                                             | Future        | 2        | Helder Souza |
| FR15-A | Care event creation — modality, optional substance, instructions, date.                                                               | Phase 1 (MVP) | 1        | Helder Souza |
| FR15-B | Recurring care event scheduling — interval (hours/days/months/years), indefinite until cancelled/archived.                            | Phase 1 (MVP) | 1        | Helder Souza |
| FR15-C | Temporary care event with end date — no occurrences after end date, auto-completed.                                                   | Phase 1 (MVP) | 1        | Helder Souza |
| FR16   | Care event and appointment optional linking — bidirectional, informational only, no dependency.                                       | Phase 1 (MVP) | 2        | Helder Souza |
| FR17   | Care event due-date in-app notification — notification when occurrence is due.                                                        | Phase 1 (MVP) | 2        | Helder Souza |
| FR18   | Proactive care event reminders — 7, 3, 1 day before due date.                                                                         | Phase 4       | 2        | Helder Souza |
| FR19-A | Inventory item creation — name, category, quantity, UOM, purchase date, expiration date.                                              | Phase 2       | 1        | Helder Souza |
| FR19-B | Inventory quantity adjustment — manual update, negative quantities prevented.                                                         | Phase 2       | 1        | Helder Souza |
| FR20-A | Quantity threshold alert rule — alert when quantity falls below configured threshold.                                                 | Phase 2       | 2        | Helder Souza |
| FR20-B | Expiration window alert rule — alert when item reaches warning window before expiry.                                                  | Phase 2       | 2        | Helder Souza |
| FR21-A | Inventory usage template decrement — 1-click decrement from care event, optional link.                                                | Phase 2       | 3        | Helder Souza |
| FR21-B | Insufficient stock handling on template decrement — warn and prevent decrement, save event without link.                              | Phase 2       | 3        | Helder Souza |
| FR21-C | Inventory adjustment reversal with audit tracking — reverse accidental decrements, full audit log.                                    | Phase 2       | 3        | Helder Souza |
| FR22-A | Single maintenance task creation — type, description, scheduled date, optional assignee.                                              | Phase 2       | 2        | Helder Souza |
| FR22-B | Recurring maintenance task creation — daily/weekly/monthly recurrence, auto-generates future occurrences.                             | Phase 2       | 2        | Helder Souza |
| FR23-A | Maintenance task notifications — all staff notified on create/due, assignee gets additional notification.                             | Phase 2       | 2        | Helder Souza |
| FR23-B | Maintenance task completion tracking — log timestamp and completing staff member.                                                     | Phase 2       | 2        | Helder Souza |
| FR24   | Two-tier notification delivery — Standard (in-app) vs Custom (+ email/push), per-event configuration.                                 | Phase 2       | 2        | Helder Souza |
| FR25-A | Notification delivery status tracking and retry — track status, 3-retry policy with backoff.                                          | Phase 2       | 2        | Helder Souza |
| FR25-B | Auto-suppression and failure banner — suppress after 3 consecutive failures, banner until acknowledged.                               | Phase 2       | 2        | Helder Souza |
| FR26-A | Adoption Profile link generation — demographic data + media only, requires 'Available for Adoption' flag.                             | Phase 3       | 2        | Helder Souza |
| FR26-B | Veterinary Profile link generation — full medical history, appointments, documents, media.                                            | Phase 3       | 2        | Helder Souza |
| FR27   | Configurable link TTL — max 90 days, renewable, no permanent option.                                                                  | Phase 3       | 2        | Helder Souza |
| FR28-A | Adoption Profile link generation restriction — requires 'Available for Adoption' flag active.                                         | Phase 3       | 2        | Helder Souza |
| FR28-B | Shareable link prohibition for archived pets — no new links for archived pets, auto-revoke on archival.                               | Phase 3       | 2        | Helder Souza |
| FR29   | Manual link revocation — revoke any active link, immediate invalidation.                                                              | Phase 3       | 2        | Helder Souza |
| FR30-A | Pet search and filtering — by name, species, status, adoption availability, shelter-scoped.                                           | Phase 4       | 3        | Helder Souza |
| FR30-B | Inventory search and filtering — by name, category, alert status, shelter-scoped.                                                     | Phase 4       | 3        | Helder Souza |
| FR30-C | Maintenance task search and filtering — by type, status, shelter-scoped.                                                              | Phase 4       | 3        | Helder Souza |
| FR31   | Per-shelter dashboard overview — KPIs: active pets, treatment count, foster count, staff, inventory alerts, maintenance, care events. | Phase 4       | 3        | Helder Souza |
| FR32-A | Pet census report — active pets grouped by species.                                                                                   | Phase 4       | 3        | Helder Souza |
| FR32-B | Archived pet log report — by outcome with adopter details for adopted pets.                                                           | Phase 4       | 3        | Helder Souza |
| FR32-C | Treatment list report — pets with active temporary care events.                                                                       | Phase 4       | 3        | Helder Souza |
| FR33-A | Inventory status report — categorized with below-threshold and near-expiry highlighting.                                              | Phase 4       | 3        | Helder Souza |
| FR33-B | Inventory alert history report — chronological log of all alert events.                                                               | Phase 4       | 3        | Helder Souza |
| FR34-A | Maintenance task status report — grouped by status with completion attribution.                                                       | Phase 4       | 3        | Helder Souza |
| FR34-B | Cleaning event frequency report — count of cleaning tasks in date range.                                                              | Phase 4       | 3        | Helder Souza |
| FR35-A | Staff headcount report — by role (Admin, Staff, Read-only), Admins only.                                                              | Phase 4       | 3        | Helder Souza |
| FR35-B | Care event summary report — counts by modality in date range.                                                                         | Phase 4       | 3        | Helder Souza |
| FR36   | Shareable link activity log — all links per pet with type, TTL, status, revocation events. Admins only.                               | Phase 4       | 3        | Helder Souza |
| FR37   | User registration and authentication via Google SSO — replaces local profile for cloud access.                                        | Phase 3       | 1        | Helder Souza |
| FR38   | Shelter admin role assignment on creation — auto-assigns Admin role, no global Super Admin.                                           | Phase 3       | 1        | Helder Souza |
| FR39   | Staff invite link generation and redemption — identity-bound, single-use, 30-day expiry.                                              | Phase 3       | 1        | Helder Souza |
| FR40   | Role-based access control (Admin, Staff, Read-only) — per shelter, immediate effect.                                                  | Phase 3       | 1        | Helder Souza |


**Priority Scale**:

- **1 — Immediate**: Critical to project success; without it, the project is not viable.
- **2 — High**: Important for a complete solution.
- **3 — Moderate**: Valuable, could be in MVP.
- **4 — Low**: Not critical; success does not depend on it.
- **5 — Prospective**: Out of current scope, planned for future releases.

> **Note**: Priority reflects business value and importance to project success. Phase reflects the planned delivery schedule. A high-priority requirement may be scheduled for a later phase if it has complex dependencies, and a lower-priority requirement may be included in an earlier phase if it is low-effort and complements other features.

---

## 11. Non-Functional Requirements


| PRD ID | Requirement                                                                                                                                                                                                                                                                                                                                                                                                                                                            | Remarks                                                                                                                                                                                                |
| :------ | :---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | :------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| NFR01  | The system shall provide an interface that is intuitive and usable by shelter staff with varied levels of technical proficiency, requiring minimal onboarding. Common tasks (e.g., registering a pet, logging a care event, creating a maintenance task) must be completable in fewer than 5 clicks from the dashboard.                                                                                                                                                | Onboarding should not require formal training sessions.                                                                                                                                                |
| NFR02  | 95% of all page loads shall complete in under 2 seconds. Search queries shall return results in under 300 milliseconds. Dashboard rendering shall complete in under 1 second.                                                                                                                                                                                                                                                                                          | Phase 1: measured under single-user local operation. Phase 3+: measured under normal operating conditions (up to 50 concurrent users).                                                                                                                                |
| NFR03  | The system shall maintain 99.5% uptime measured monthly, excluding scheduled maintenance windows communicated at least 24 hours in advance.                                                                                                                                                                                                                                                                                                                            | Phase 1 (offline MVP) targets local device availability; cloud uptime SLA (99.5%) applies from Phase 3 onward.                                                                                         |
| NFR04  | The system shall support single-user operation on a single device with responsive performance in Phase 1. From Phase 3 onward, the system shall support at least 50 concurrent users across 10 shelters without performance degradation below the thresholds defined in NFR02.                                                                                                                                                                                         | Phase 1 is single-user local. Multi-user horizontal scaling applies from Phase 3.                                                                                                                      |
| NFR05  | In-app notifications shall be delivered to all targeted recipients within 5 seconds of the triggering event.                                                                                                                                                                                                                                                                                                                                                           | Covers all notification types: care events, inventory alerts, maintenance tasks, reminders.                                                                                                            |
| NFR06  | Email and push notifications shall be delivered within 60 seconds of the triggering event under normal conditions. A 3-retry policy with backoff shall be applied on delivery failure before escalation (see FR25).                                                                                                                                                                                                                                                    | Deferred to Phase 2+ (online). Phase 1 (offline MVP) uses local in-app alerts only.                                                                                                                    |
| NFR07  | All system features shall be gated by the user's assigned role within a shelter. Read-only users cannot create, edit, or delete records. Write access is restricted to Staff-level and above. Shelter settings and user management are restricted to Admins.                                                                                                                                                                                                           | Role enforcement is validated server-side on every request. Phase 1 (offline MVP) operates in single-user mode; role enforcement is not applicable. Full RBAC enforcement applies from Phase 3 onward. |
| NFR08  | In Phase 1, data isolation is enforced between local shelter profiles on the device. From Phase 3 onward, users can only access data within shelters they have been assigned to, with data-layer enforcement preventing cross-shelter data leakage regardless of client-side state.                                                                                                                                                                                    | Phase 1: local shelter-scoped isolation. Phase 3+: multi-tenant isolation with no global platform administrator role.                                                                                  |
| NFR09  | A pet's full medical history, veterinary documents, treatment records, and media are accessible only to authenticated, authorized shelter staff — or via an explicitly generated Veterinary Profile link.                                                                                                                                                                                                                                                              | Adoption Profile links must never expose medical data.                                                                                                                                                 |
| NFR10  | Shareable profile links shall not expose any internal system identifiers, user account information, or metadata beyond the explicitly defined data subset for that link type.                                                                                                                                                                                                                                                                                          | Link URLs must use opaque, non-sequential tokens.                                                                                                                                                      |
| NFR11  | Uploaded veterinary documents and pet media (photos/videos) must not be accessible via guessable or enumerable public URLs. Access requires authentication or a valid active shareable link.                                                                                                                                                                                                                                                                           | Implementation must ensure secure, expiring access tokens for media assets.                                                                                                                            |
| NFR12  | Revoked and expired shareable links must be immediately and permanently invalidated. Accessing a revoked or expired link must return a clear, non-revealing denial response with no cached or stale data.                                                                                                                                                                                                                                                              | —                                                                                                                                                                                                      |
| NFR13  | The system must log all significant actions: user account creation and role changes, record creation and modification, document and media uploads, shareable link generation/renewal/revocation, pet outcome status changes, notification delivery failures, and inventory adjustments. Logs must be accessible to Admins of the relevant shelter.                                                                                                                     | Audit logs are append-only and not editable by any user.                                                                                                                                               |
| NFR14  | Email and push notification bodies must not contain sensitive pet medical data. Notifications shall include a summary and a prompt directing the user to log in for details.                                                                                                                                                                                                                                                                                           | Applies to all Custom-mode (email/push) notifications.                                                                                                                                                 |
| NFR15  | The system shall perform daily automated backups. Recovery Point Objective (RPO) shall be less than 24 hours. Recovery Time Objective (RTO) shall be less than 4 hours.                                                                                                                                                                                                                                                                                                | Backup integrity should be validated periodically via restore tests.                                                                                                                                   |
| NFR16  | All records are kept indefinitely. The system must support a "Data Deletion Request" workflow where an Admin requests deletion, followed by a 7-day cooling-off period before hard-deletion. During this 7-day window, the requesting Admin may cancel the deletion request with a single click, restoring the data. The system explicitly mandates "Tombstoning" (replacing PII with `[GDPR ERASURE VERIFIED]`) in the immutable audit logs instead of dropping rows. | Hard-delete is an administrative action following a 7-day cooling-off period.                                                                                                                          |
| NFR17  | The system shall provide a persistent global search bar accessible from any view, supporting fuzzy matching and autocomplete for pets, inventory, and maintenance tasks.                                                                                                                                                                                                                                                                                               | Global Search is scoped to the active shelter context.                                                                                                                                                 |


---

## 12. Glossary


| Term                          | Definition                                                                                                                                                                                                                 |
| :----------------------------- | :-------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **BRD**                       | Business Requirement Document — a formal document describing the business goals, current process, scope, and requirements of a project.                                                                                    |
| **PRD**                       | Project Requirement Document — a technical companion to the BRD detailing specific functional, reporting, and security requirements.                                                                                       |
| **MVP**                       | Minimum Viable Product — the minimum set of features required to launch a functional version of the platform.                                                                                                              |
| **FIV**                       | Feline Immunodeficiency Virus — a viral disease specific to cats tracked as part of the pet health profile.                                                                                                                |
| **FeLV**                      | Feline Leukemia Virus — a viral disease specific to cats tracked as part of the pet health profile.                                                                                                                        |
| **Vermifuge**                 | A medication used to eliminate internal parasites (worms) from an animal.                                                                                                                                                  |
| **RBAC**                      | Role-Based Access Control — an access management model where permissions are assigned to roles rather than individual users.                                                                                               |
| **Google SSO**                | Google Single Sign-On — an authentication mechanism allowing users to sign in using their existing Google account credentials.                                                                                             |
| **Shadow Record**             | A read-only copy of a pet's record created in a receiving shelter during an internal transfer, linking back to the original record in the originating shelter.                                                             |
| **Invite Link**               | A URL generated by a shelter administrator that allows an unregistered user to join the shelter with a pre-assigned role upon authentication via Google SSO.                                                               |
| **Inventory Usage Template**  | A pre-configured template that defines specific inventory items and quantities to be decremented in a single action during care event recording.                                                                           |
| **Soft Delete**               | A deletion method where the record is marked as inactive rather than permanently removed, preserving referential integrity with linked records.                                                                            |
| **In Foster**                 | A pet lifecycle outcome status indicating the animal has been placed in a temporary foster home but remains under the shelter's responsibility.                                                                            |
| **Adopter Details**           | Contact information (Name, Phone, Address) captured for the person adopting a pet, stored securely and accessible only to authorized shelter personnel.                                                                    |
| **DOB Estimated Flag**        | A boolean flag on a pet profile indicating that the recorded date of birth is an estimate rather than a known date.                                                                                                        |
| **Shareable Profile Link**    | A URL generated by the system granting anonymous, read-only access to a defined subset of a pet's profile data.                                                                                                            |
| **TTL**                       | Time-to-Live — a configurable duration (maximum 90 days, renewable) after which a shareable link automatically expires.                                                                                                    |
| **Intake Origin**             | The source from which a pet arrived at the shelter (e.g., street rescue, owner surrender).                                                                                                                                 |
| **Archived Pet**              | A pet whose outcome status has been set to a terminal outcome (Adopted, Deceased, or Transferred). Its full history is preserved but it no longer appears in active operational views. Note: 'In Foster' is a reversible, non-archival status — fostered pets remain in active views. |
| **Inventory Alert**           | A system notification triggered when an inventory item reaches a configured quantity threshold or approaches its expiration date.                                                                                          |
| **Care Event**                | A recorded instance of a treatment, vaccine, vermifuge, or other care activity administered to a pet.                                                                                                                      |
| **Vet Directory**             | A shared, searchable registry of veterinary clinics and professionals maintained within the platform.                                                                                                                      |
| **Identity-Bound**            | A characteristic of an invite link that restricts its redemption to the specific email address it was issued to.                                                                                                           |
| **Tombstoning**               | The process of replacing Personally Identifiable Information (PII) in immutable logs with a standard placeholder (e.g., `[GDPR ERASURE VERIFIED]`) to comply with data deletion requests while preserving audit integrity. |
| **Local Operator Profile**    | A user profile consisting of basic identification data (name, contact/email) stored locally on the device, enabling access without external authentication services.                                                       |
| **Data Export**               | The capability to extract all local shelter data into a portable format for backup or migration to future online versions of the platform.                                                                                 |
| **Offline-First MVP**         | A minimum viable product designed to operate entirely on a single device without network connectivity, focused on validating core workflows before investing in cloud infrastructure.                                      |
| **Shelter Context Switching** | The ability for the operator to switch the active shelter scope, redirecting all operations and views to the selected shelter's data.                                                                                      |


---

## 13. References


| Reference                   | Description                                                                                                                                            |
| :--------------------------- | :------------------------------------------------------------------------------------------------------------------------------------------------------ |
| BRD_TEMPLATE.md             | Official BRD template used as structural reference for this document.                                                                                  |
| Interview Session (v1)      | Initial requirements gathering interview conducted with Helder Souza on 2026-07-08, session ID: b2380c32648c0da1e89001d4acba2599.                      |
| Interview Session (v2)      | Gap analysis and second grilling session conducted on 2026-07-08 within conversation a1f7fef5-d577-49bf-9e65-bcd058dcf534.                             |
| Architect Feedback Sessions | Design decision reviews conducted on 2026-07-09 addressing authentication model, pet lifecycle, transfers, notifications, and shareable link policies. |


---

## 14. Appendix

### Appendix A — Pet Registration Data Model (Logical Fields)


| Field                  | Description                                                                                                           | Notes                              |
| :---------------------- | :--------------------------------------------------------------------------------------------------------------------- | :---------------------------------- |
| Name                   | The pet's given name at the shelter                                                                                   | Required                           |
| Date of Birth          | Approximate or actual date of birth                                                                                   | Required                           |
| DOB Estimated          | Flag indicating the date of birth is an estimate                                                                      | Boolean; defaults to false         |
| Species                | e.g., Dog, Cat, Rabbit                                                                                                | Required                           |
| Breed / Race           | Specific breed classification                                                                                         | Required                           |
| Sex                    | Male / Female                                                                                                         | Required                           |
| Color / Markings       | Physical appearance descriptor                                                                                        | Required                           |
| Intake Origin          | Source of intake: Street Rescue, Owner Surrender, Transfer from Another Shelter, Born at Shelter, Other (+ free text) | Required                           |
| Health Conditions      | Known diseases or conditions                                                                                          | e.g., FIV, FeLV, diabetes          |
| Current Health Status  | Active health state (Healthy, In Treatment, Recovering)                                                               | Required                           |
| Available for Adoption | Boolean flag indicating adoption availability                                                                         | Toggled by staff                   |
| Outcome Status         | Lifecycle outcome: Active, Adopted, Deceased, Transferred, In Foster                                                  | Defaults to Active                 |
| Media                  | Photos and/or videos of the pet                                                                                       | Optional; multiple files supported |


### Appendix B — Pet Care Event Data Model (Logical Fields)


| Field                    | Description                                                                            | Notes                                                                                                     |
| :------------------------ | :-------------------------------------------------------------------------------------- | :--------------------------------------------------------------------------------------------------------- |
| Care Modality            | Type of care: Vaccine, Vermifuge, Medication, Physical Therapy, Hospitalization, Other | Required                                                                                                  |
| Substance / Product Name | Name of the substance or product administered (e.g., Antirabies, Ivermectin)           | Optional                                                                                                  |
| Recurrence Interval      | How frequently the care event repeats (hours/days/months/years)                        | Required for recurring events                                                                             |
| End Date                 | Date on which a temporary treatment concludes                                          | Optional; if left blank, the event repeats indefinitely until explicitly cancelled or the pet is archived |
| Treatment Instructions   | Specific administration instructions (e.g., after meal)                                | Optional                                                                                                  |
| Administered By          | Staff member recording the event                                                       | Auto-captured                                                                                             |
| Date Administered        | Date and time of care event                                                            | Required                                                                                                  |
| Linked Appointment       | Optional reference to a veterinary appointment                                         | Optional; informational only                                                                              |


### Appendix C — Inventory Item Data Model (Logical Fields)


| Field           | Description                                               | Notes                     |
| :--------------- | :--------------------------------------------------------- | :------------------------- |
| Item Name       | Name of the supply or product                             | Required                  |
| Category        | Food / Medication / Cleaning Supplies / Equipment / Other | Required                  |
| Quantity        | Current quantity in stock                                 | Required                  |
| Unit of Measure | e.g., units, kg, g, L, mL                                 | Required                  |
| Purchase Date   | Date the item was acquired                                | Required                  |
| Expiration Date | Date the item expires                                     | Required where applicable |
| Description     | Additional product details or usage notes                 | Optional                  |
| Alert Threshold | Configurable trigger value for low-stock notification     | Per-item configuration    |


### Appendix D — Adopter Details Data Model (Logical Fields)


| Field         | Description                              | Notes                  |
| :------------- | :---------------------------------------- | :---------------------- |
| Adopter Name  | Full name of the person adopting the pet | Required upon adoption |
| Phone         | Contact phone number of the adopter      | Required upon adoption |
| Address       | Residential address of the adopter       | Required upon adoption |
| Pet Reference | Link to the adopted pet's record         | System-generated       |
| Adoption Date | Date the adoption was recorded           | Auto-captured          |


### Appendix E — Shareable Link Configuration


| Parameter  | Description                                                | Options                                                        |
| :---------- | :---------------------------------------------------------- | :-------------------------------------------------------------- |
| Link Type  | Determines data visibility scope                           | Adoption Profile / Veterinary Profile                          |
| TTL        | Time-to-live duration                                      | Configurable (e.g., 7 days, 30 days, 90 days); maximum 90 days |
| Renewable  | Whether the link can be renewed before or after expiration | Yes                                                            |
| Status     | Current link state                                         | Active / Revoked / Expired                                     |
| Revocation | Manual revocation by any authorized staff member           | Available at any time                                          |


### Appendix F — Notification Delivery Modes


| Mode     | In-App | Email                       | Push Notification           | Failure Handling                                          |
| :-------- | :------ | :--------------------------- | :--------------------------- | :--------------------------------------------------------- |
| Standard | Yes    | No                          | No                          | N/A                                                       |
| Custom   | Yes    | Optional (staff configured) | Optional (staff configured) | Retry up to 3 times; escalate to in-app banner on failure |


### Appendix G — MVP Phase Summary


| Phase                              | Version | Key Capabilities                                                                                                                                                                                                                                        |
| :---------------------------------- | :------- | :------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| MVP (Phase 1 — Offline Validation) | v1.0    | Local operator profile, multi-shelter management, shelter context switching, data export, pet registration and lifecycle management, vet directory, appointment logging (with retroactive warnings), care event recording, local in-app due-date alerts |
| Phase 2                            | v1.1    | Inventory management, alert rules, usage templates, maintenance scheduling, two-tier notifications, failure escalation                                                                                                                                  |
| Phase 3 (Online Foundation)        | v1.2    | Google SSO authentication, multi-user support, staff invite links, RBAC, shareable pet profile links, configurable TTL, link revocation                                                                                                                 |
| Phase 4                            | v1.3    | Proactive care event reminders, dashboard and reporting module, pet/inventory/maintenance/staff/link reports, search and filtering                                                                                                                      |
| Future                             | v2.0+   | Advanced analytics, internal transfer shadow records, appointment soft delete                                                                                                                                                                           |


