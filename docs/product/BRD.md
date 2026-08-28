# Business Requirement Document: Luna's Pet Central

**Project Details**:

| Field | Value |
| :--- | :--- |
| **Project Name** | Luna's Pet Central |
| **Creator** | Helder Souza |
| **Email** | hellder.souza@proton.me |
| **Document No.** | BRD-LPC-001 |
| **Date** | 2026-08-28 |
| **Version** | 3.0 |

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
- **Internal Transfer Shadow Records**: When a pet is transferred between shelters within the platform, a read-only shadow record is created in the receiving shelter linking back to the original record. The transfer migrates all active treatments to the receiving shelter. (Note: Planned for post-MVP v2.0+)
- **Pet Media**: Photos and videos uploadable to pet profiles.
- **Veterinary Clinic & Professional Directory**: A searchable directory of clinics and veterinarians, reusable across appointments.
- **Veterinary Appointment Tracking**: Logging appointments with clinic/hospital and veterinarian selected from the directory, including document uploads (PDF, images). Appointments support soft delete with preservation of any linked care event references. (Note: Planned for post-MVP v2.0+)
- **Pet Care Tracking**: Scheduling and recording of recurring care events including vaccines, vermifuge treatments, and temporary medications. Care events can be optionally linked to a vet appointment.
- **Proactive Care Event Reminders**: In-app reminders sent 7, 3, and 1 day before a care event's due date.
- **Inventory / Stock Management**: Categorized tracking of all shelter consumables with quantity, units, purchase date, and expiration date fields.
- **Dynamic Inventory Alerts**: Configurable notifications triggered by low stock thresholds and approaching expiration dates.
- **Inventory Usage Templates**: Pre-configured templates enabling 1-click inventory decrement directly from care event recording.
- **Maintenance Scheduling**: Creation and tracking of maintenance tasks with optional staff assignment and notifications.
- **Notification System**: Basic local in-app notifications only for reminders and alerts.

- **Search and Filtering**: Search across pets and inventory; filter maintenance tasks by type and status.
- **Reporting and Dashboards**: Summary views covering active pet counts, staff counts, care activity, inventory status, and maintenance history.
- **Data Deletion (GDPR)**: Support for GDPR data deletion requests featuring a 7-day cooling-off period before hard deletion, during which the requesting Admin may cancel the deletion request with a single click, restoring the data, utilizing "Tombstoning" to replace PII in immutable audit logs.

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
- Google SSO & cloud authentication (deferred).
- Multi-user collaboration & RBAC (deferred).
- Staff invite links (deferred).
- External shareable links (deferred).
- Email/push notification delivery (deferred).

---

## 4. Business Drivers

| Driver | Description |
| :--- | :--- |
| **Operational Efficiency** | Replace fragmented manual workflows with a single digital source of truth, reducing time spent searching for records and coordinating verbally. |
| **Improved Animal Care Quality** | Structured tracking of treatment schedules, vaccines, and medical history — with proactive reminders — ensures no animal misses critical care events. |
| **Inventory Waste Reduction** | Proactive alerts for low stock and upcoming product expiration reduce waste and prevent shortages of critical supplies. |
| **Organizational Scalability** | A platform designed for multi-shelter management allows the organization to scale operations without proportionally scaling administrative overhead. |
| **Data Accessibility and Transparency** | Enabling secure, controlled sharing of pet data with veterinarians and adoption candidates improves outcomes and trust. |
| **Risk Mitigation** | Digitizing physical paper records reduces the risk of losing critical medical history in the event of fire, flooding, or misplacement. |
| **Pet Lifecycle Traceability** | Tracking adoption, death, transfer, and foster outcomes provides complete traceability and enables accurate reporting on shelter throughput. |

---

## 5. Business Success Criteria

| KPI ID | KPI | Target | Measurement Window |
| :--- | :--- | :--- | :--- |
| KPI-01 | Time to retrieve a pet's medical record | Reduce from 10+ minutes to under 30 seconds | Post-deployment |
| KPI-02 | Expired inventory waste | Reduce by 80% | Within 6 months of deployment |
| KPI-03 | Treatment compliance rate | Achieve 95% compliance through proactive reminders | Within 6 months of deployment |
| KPI-04 | Lost medical records | Zero lost records | Post-deployment |
| KPI-05 | Administrative overhead | Reduce by 40% through digital workflows | Within 6 months of deployment |
| KPI-06 | Adoption rate | Increase by 15% through transparent, shareable adoption profiles | Within 12 months of deployment |
| KPI-07 | Operator engagement | Single operator actively using the tool for daily shelter operations | Within 2 weeks of first use |

---

## 6. User Personas

### Shelter Operator

| Attribute | Detail |
| :--- | :--- |
| **Role** | Creates and manages shelters locally on a single device |
| **Goals** | Manage shelter operations, monitor dashboard, export data |
| **Pain Points** | Scattered information across paper records, no visibility into shelter performance |

### Shelter Staff

*Note: Deferred to online multi-user phase (Phase 3+).*

| Attribute | Detail |
| :--- | :--- |
| **Role** | Day-to-day operational user responsible for pet care and shelter upkeep |
| **Goals** | Register pets, administer and log care events, update inventory, manage maintenance tasks |
| **Pain Points** | Repetitive manual data entry, forgotten care schedules, no stock level visibility, no reminders for upcoming treatments |

### Veterinarian (External via Shareable Link)

*Note: Access via shareable links is deferred.*

| Attribute | Detail |
| :--- | :--- |
| **Role** | External medical professional consulting on a pet's health |
| **Goals** | Consult pet medical history, review treatment records and uploaded documents |
| **Pain Points** | Incomplete or delayed records, no centralized view of a pet's history, reliance on paper handoffs |

### Adopter (External via Shareable Link)

*Note: Access via shareable links is deferred.*

| Attribute | Detail |
| :--- | :--- |
| **Role** | Prospective pet adopter browsing available animals |
| **Goals** | Evaluate available pets, view photos/videos and demographic information |
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
4. **Inventory**: All items are logged in categorized inventory with quantity, unit of measure, purchase date, and expiration date. Alert thresholds are configured per item with Standard (in-app) or Custom (email and/or push) notification modes. Staff adjust stock levels as items are consumed, with inventory usage templates enabling 1-click decrement directly from care event recording.
5. **Maintenance**: Maintenance tasks are created, optionally assigned to a specific staff member, and scheduled. All staff (and the assignee) receive notifications. Completion is logged.
6. **Information Sharing**: Staff generate a shareable link for a specific pet with a configurable TTL (maximum 90 days, renewable). Two link types govern visibility. Links can be manually revoked at any time, and are auto-revoked when a pet is archived.
7. **Pet Outcomes**: When a pet is adopted, deceased, transferred, or placed in foster care, staff update the outcome status. Adoption requires capturing adopter details (Name, Phone, Address). Transfers simply archive the pet. The pet is archived — full history preserved, removed from active dashboards. Auto-cancel pending care events, clear adoption availability flag.
8. **Authentication**: The operator creates a local profile with name and contact details. No external login required. The operator accesses the tool directly on their device.
9. **Data Deletion & Retention**: Records are kept indefinitely unless a GDPR deletion request is submitted. Deletion undergoes a 7-day cooling-off period before hard deletion, during which the requesting Admin may cancel the request with a single click, restoring the data. PII in immutable audit logs undergoes Tombstoning.

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

### Phase 4 (v1.3 — Reporting & Discovery)
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

| PRD ID | Requirement | Phase | Priority | Raised By |
| :--- | :--- | :--- | :--- | :--- |
| FR01 | The system shall allow a single operator to register a local profile (name, contact/email) stored on the device, providing immediate offline access without third-party authentication. | Phase 1 (MVP) | 1 | Helder Souza |
| FR02 | The system shall allow the operator to create, edit, and manage multiple shelter profiles on a single device. Each shelter maintains independent data. The operator can switch between shelters. | Phase 1 (MVP) | 1 | Helder Souza |
| FR03 | The system shall provide a complete data export capability allowing the operator to extract all shelter records (pets, appointments, care events, media references) in a portable format for backup or future migration. | Phase 1 (MVP) | 1 | Helder Souza |
| FR04 | The system shall scope all operations (views, records, searches) to the operator's currently active shelter context, with a mechanism to switch between shelters. | Phase 1 (MVP) | 1 | Helder Souza |
| FR05 | The system shall allow registration of pet profiles including: name, date of birth, species, breed/race, sex, color, intake origin (structured dropdown with 'Other' + free text), health conditions, current health status, and an estimated date-of-birth flag. | Phase 1 (MVP) | 1 | Helder Souza |
| FR06 | The system shall support an 'Available for Adoption' flag on each pet profile, toggled by authorized staff. | Phase 1 (MVP) | 1 | Helder Souza |
| FR07 | The system shall allow staff to upload one or more photos and videos to a pet's profile. Media shall be visible in both Adoption and Veterinary shareable link views. | Phase 1 (MVP) | 2 | Helder Souza |
| FR08 | The system shall support pet lifecycle outcome statuses: Adopted, Deceased, Transferred, and In Foster. Setting an outcome archives the pet — full history is preserved and searchable, but the pet is removed from active dashboard counts. | Phase 1 (MVP) | 1 | Helder Souza |
| FR09 | The system shall require capturing adopter details (Name, Phone, Address) when a pet's outcome is set to Adopted. | Phase 1 (MVP) | 1 | Helder Souza |
| FR10 | The system shall create a read-only shadow record in the receiving shelter when a pet is transferred internally between shelters on the platform. External transfers shall simply archive the pet. | Future | 2 | Helder Souza |
| FR11 | The system shall maintain a searchable and filterable directory of veterinary clinics and professionals. Staff select from the directory or add a new entry when creating an appointment. | Phase 1 (MVP) | 1 | Helder Souza |
| FR12 | The system shall allow staff to log veterinary appointments, selecting the clinic and veterinarian from the directory, with fields for: appointment date and notes. The system shall display a confirmation warning when a past appointment date is entered. | Phase 1 (MVP) | 1 | Helder Souza |
| FR13 | The system shall support uploading and storing documents (PDF and image formats) as attachments to veterinary appointment records. Multiple files per appointment must be supported. | Phase 1 (MVP) | 1 | Helder Souza |
| FR14 | The system shall support soft deletion of veterinary appointments. Soft-deleted appointments shall preserve any linked care event references intact. | Future | 2 | Helder Souza |
| FR15 | The system shall support recording of pet care events with fields for: care modality (Vaccine, Vermifuge, Medication, Physical Therapy, Hospitalization, Other), substance/product name (optional), recurrence interval (hours/days/months/years), end date (if temporary), and treatment instructions. | Phase 1 (MVP) | 1 | Helder Souza |
| FR16 | The system shall allow a care event to be optionally linked to a vet appointment (bidirectional, informational only — no dependency enforced). A care event can be created from within an appointment record, or an existing event can be assigned to an appointment. | Phase 1 (MVP) | 2 | Helder Souza |
| FR17 | The system shall send an in-app notification when a scheduled care event is due. | Phase 1 (MVP) | 2 | Helder Souza |
| FR18 | The system shall send proactive in-app reminders 7, 3, and 1 day before a scheduled care event's due date. | Phase 4 | 2 | Helder Souza |
| FR19 | The system shall maintain a categorized inventory of shelter supplies. Categories: Food, Medication, Cleaning Supplies, Equipment, Other. Fields per item: name, category, quantity, unit of measure (units/kg/g/L/mL), purchase date, expiration date, description. | Phase 2 | 1 | Helder Souza |
| FR20 | The system shall provide configurable, per-item inventory alert rules triggered by: quantity below a threshold, estimated depletion date, or expiration date within a defined window. | Phase 2 | 2 | Helder Souza |
| FR21 | The system shall provide inventory usage templates that allow 1-click decrement of inventory quantities directly from care event recording. | Phase 2 | 3 | Helder Souza |
| FR22 | The system shall support creation and scheduling of maintenance tasks with fields for: task type (Repair, Preventive Maintenance, Cleaning), description, scheduled date, recurrence (optional), and optional assignee. | Phase 2 | 2 | Helder Souza |
| FR23 | The system shall notify all shelter staff when a maintenance task is created or becomes due. If a task is assigned to a specific staff member, that person is also individually notified. Staff can mark tasks as completed; completion is logged with timestamp and staff member. | Phase 2 | 2 | Helder Souza |
| FR24 | The system shall implement a two-tier notification delivery system: Standard (in-app only) and Custom (staff configure, per notifiable event, whether email and/or push notification is sent in addition to in-app). This applies to all event types: care reminders, inventory alerts, and maintenance tasks. | Phase 2 | 2 | Helder Souza |
| FR25 | The system shall track notification delivery status. Failed notifications shall be retried up to 3 times. After 3 failed retries, the system shall escalate the failure to an in-app banner visible to the intended recipient. | Phase 2 | 2 | Helder Souza |
| FR26 | The system shall enable staff to generate shareable links for pet profiles with two link types: Adoption Profile (demographic data only) and Veterinary Profile (full profile including medical records). | Phase 3 | 2 | Helder Souza |
| FR27 | Each shareable link shall have a configurable TTL with a maximum of 90 days. Links shall be renewable before or after expiration. No permanent links are supported. | Phase 3 | 2 | Helder Souza |
| FR28 | The system shall restrict Adoption Profile link generation to pets with the 'Available for Adoption' flag active. | Phase 3 | 2 | Helder Souza |
| FR29 | The system shall allow any authorized staff member to manually revoke a shareable link at any time. | Phase 3 | 2 | Helder Souza |
| FR30 | The system shall provide search and filtering across: pets (by name, species, status, availability), inventory items (by name, category, alert status), and maintenance tasks (by type and status). | Phase 4 | 3 | Helder Souza |
| FR31 | The system shall provide a per-shelter dashboard overview displaying: total active pet count, count of pets currently in treatment, total staff count, inventory alert summary, maintenance activity log, and care event statistics. | Phase 4 | 3 | Helder Souza |
| FR32 | The system shall generate pet reports including: census of active pets, archived pet log, and treatment compliance list. | Phase 4 | 3 | Helder Souza |
| FR33 | The system shall generate inventory reports including: current stock status across categories and inventory alert history. | Phase 4 | 3 | Helder Souza |
| FR34 | The system shall generate maintenance reports including: scheduled tasks, completed tasks, and overdue tasks. | Phase 4 | 3 | Helder Souza |
| FR35 | The system shall generate staff activity reports and care event summary reports. | Phase 4 | 3 | Helder Souza |
| FR36 | The system shall maintain a shareable link activity log capturing link generation, access events, renewal, and revocation. | Phase 4 | 3 | Helder Souza |
| FR37 | The system shall allow user registration and authentication via Google SSO, replacing the local operator profile for cloud-based access. First-time sign-in creates a platform account; subsequent sign-ins authenticate the existing account. | Phase 3 | 1 | Helder Souza |
| FR38 | Upon creating a shelter in the online phase, the authenticated user shall automatically become the shelter's administrator. There is no global platform administrator role. | Phase 3 | 1 | Helder Souza |
| FR39 | The system shall allow shelter administrators to generate identity-bound invite links for unregistered staff. Invited users authenticate via Google SSO upon redemption (email must match) and are assigned a role within the shelter. Invite links are single-use, expire after 30 days, and are resendable (resending invalidates the previous link). | Phase 3 | 1 | Helder Souza |
| FR40 | The system shall enforce role-based access control per shelter with three roles: Admin (full access including shelter management and staff administration), Staff (full record read/write), and Read-only. A user's access is limited to shelters they were assigned to or created. | Phase 3 | 1 | Helder Souza |

**Priority Scale**:
- **1 — Immediate**: Critical to project success; without it, the project is not viable.
- **2 — High**: Important for a complete solution.
- **3 — Moderate**: Valuable, could be in MVP.
- **4 — Low**: Not critical; success does not depend on it.
- **5 — Prospective**: Out of current scope, planned for future releases.

> **Note**: Priority reflects business value and importance to project success. Phase reflects the planned delivery schedule. A high-priority requirement may be scheduled for a later phase if it has complex dependencies, and a lower-priority requirement may be included in an earlier phase if it is low-effort and complements other features.

---

## 11. Non-Functional Requirements

| PRD ID | Requirement | Remarks |
| :--- | :--- | :--- |
| NFR01 | The system shall provide an interface that is intuitive and usable by shelter staff with varied levels of technical proficiency, requiring minimal onboarding. Common tasks (e.g., registering a pet, logging a care event, creating a maintenance task) must be completable in fewer than 5 clicks from the dashboard. | Onboarding should not require formal training sessions. |
| NFR02 | 95% of all page loads shall complete in under 2 seconds. Search queries shall return results in under 300 milliseconds. Dashboard rendering shall complete in under 1 second. | Measured under normal operating conditions (up to 50 concurrent users). |
| NFR03 | The system shall maintain 99.5% uptime measured monthly, excluding scheduled maintenance windows communicated at least 24 hours in advance. | Phase 1 (offline MVP) targets local device availability; cloud uptime SLA (99.5%) applies from Phase 3 onward. |
| NFR04 | The system shall support single-user operation on a single device with responsive performance in Phase 1. From Phase 3 onward, the system shall support at least 50 concurrent users across 10 shelters without performance degradation below the thresholds defined in NFR02. | Phase 1 is single-user local. Multi-user horizontal scaling applies from Phase 3. |
| NFR05 | In-app notifications shall be delivered to all targeted recipients within 5 seconds of the triggering event. | Covers all notification types: care events, inventory alerts, maintenance tasks, reminders. |
| NFR06 | Email and push notifications shall be delivered within 60 seconds of the triggering event under normal conditions. A 3-retry policy with backoff shall be applied on delivery failure before escalation (see FR25). | Deferred to Phase 2+ (online). Phase 1 (offline MVP) uses local in-app alerts only. |
| NFR07 | All system features shall be gated by the user's assigned role within a shelter. Read-only users cannot create, edit, or delete records. Write access is restricted to Staff-level and above. Shelter settings and user management are restricted to Admins. | Role enforcement is validated server-side on every request. Phase 1 (offline MVP) operates in single-user mode; role enforcement is not applicable. Full RBAC enforcement applies from Phase 3 onward. |
| NFR08 | In Phase 1, data isolation is enforced between local shelter profiles on the device. From Phase 3 onward, users can only access data within shelters they have been assigned to, with data-layer enforcement preventing cross-shelter data leakage regardless of client-side state. | Phase 1: local shelter-scoped isolation. Phase 3+: multi-tenant isolation with no global platform administrator role. |
| NFR09 | A pet's full medical history, veterinary documents, treatment records, and media are accessible only to authenticated, authorized shelter staff — or via an explicitly generated Veterinary Profile link. | Adoption Profile links must never expose medical data. |
| NFR10 | Shareable profile links shall not expose any internal system identifiers, user account information, or metadata beyond the explicitly defined data subset for that link type. | Link URLs must use opaque, non-sequential tokens. |
| NFR11 | Uploaded veterinary documents and pet media (photos/videos) must not be accessible via guessable or enumerable public URLs. Access requires authentication or a valid active shareable link. | Implementation must ensure secure, expiring access tokens for media assets. |
| NFR12 | Revoked and expired shareable links must be immediately and permanently invalidated. Accessing a revoked or expired link must return a clear, non-revealing denial response with no cached or stale data. | — |
| NFR13 | The system must log all significant actions: user account creation and role changes, record creation and modification, document and media uploads, shareable link generation/renewal/revocation, pet outcome status changes, notification delivery failures, and inventory adjustments. Logs must be accessible to Admins of the relevant shelter. | Audit logs are append-only and not editable by any user. |
| NFR14 | Email and push notification bodies must not contain sensitive pet medical data. Notifications shall include a summary and a prompt directing the user to log in for details. | Applies to all Custom-mode (email/push) notifications. |
| NFR15 | The system shall perform daily automated backups. Recovery Point Objective (RPO) shall be less than 24 hours. Recovery Time Objective (RTO) shall be less than 4 hours. | Backup integrity should be validated periodically via restore tests. |
| NFR16 | All records are kept indefinitely. The system must support a "Data Deletion Request" workflow where an Admin requests deletion, followed by a 7-day cooling-off period before hard-deletion. During this 7-day window, the requesting Admin may cancel the deletion request with a single click, restoring the data. The system explicitly mandates "Tombstoning" (replacing PII with `[GDPR ERASURE VERIFIED]`) in the immutable audit logs instead of dropping rows. | Hard-delete is an administrative action following a 7-day cooling-off period. |
| NFR17 | The system shall provide a persistent global search bar accessible from any view, supporting fuzzy matching and autocomplete for pets, inventory, and maintenance tasks. | Global Search is scoped to the active shelter context. |

---

## 12. Glossary

| Term | Definition |
| :--- | :--- |
| **BRD** | Business Requirement Document — a formal document describing the business goals, current process, scope, and requirements of a project. |
| **PRD** | Project Requirement Document — a technical companion to the BRD detailing specific functional, reporting, and security requirements. |
| **MVP** | Minimum Viable Product — the minimum set of features required to launch a functional version of the platform. |
| **FIV** | Feline Immunodeficiency Virus — a viral disease specific to cats tracked as part of the pet health profile. |
| **FeLV** | Feline Leukemia Virus — a viral disease specific to cats tracked as part of the pet health profile. |
| **Vermifuge** | A medication used to eliminate internal parasites (worms) from an animal. |
| **RBAC** | Role-Based Access Control — an access management model where permissions are assigned to roles rather than individual users. |
| **Google SSO** | Google Single Sign-On — an authentication mechanism allowing users to sign in using their existing Google account credentials. |
| **Shadow Record** | A read-only copy of a pet's record created in a receiving shelter during an internal transfer, linking back to the original record in the originating shelter. |
| **Invite Link** | A URL generated by a shelter administrator that allows an unregistered user to join the shelter with a pre-assigned role upon authentication via Google SSO. |
| **Inventory Usage Template** | A pre-configured template that defines specific inventory items and quantities to be decremented in a single action during care event recording. |
| **Soft Delete** | A deletion method where the record is marked as inactive rather than permanently removed, preserving referential integrity with linked records. |
| **In Foster** | A pet lifecycle outcome status indicating the animal has been placed in a temporary foster home but remains under the shelter's responsibility. |
| **Adopter Details** | Contact information (Name, Phone, Address) captured for the person adopting a pet, stored securely and accessible only to authorized shelter personnel. |
| **DOB Estimated Flag** | A boolean flag on a pet profile indicating that the recorded date of birth is an estimate rather than a known date. |
| **Shareable Profile Link** | A URL generated by the system granting anonymous, read-only access to a defined subset of a pet's profile data. |
| **TTL** | Time-to-Live — a configurable duration (maximum 90 days, renewable) after which a shareable link automatically expires. |
| **Intake Origin** | The source from which a pet arrived at the shelter (e.g., street rescue, owner surrender). |
| **Archived Pet** | A pet whose outcome status has been set (Adopted, Deceased, Transferred, In Foster). Its full history is preserved but it no longer appears in active operational views. |
| **Inventory Alert** | A system notification triggered when an inventory item reaches a configured quantity threshold or approaches its expiration date. |
| **Care Event** | A recorded instance of a treatment, vaccine, vermifuge, or other care activity administered to a pet. |
| **Vet Directory** | A shared, searchable registry of veterinary clinics and professionals maintained within the platform. |
| **Identity-Bound** | A characteristic of an invite link that restricts its redemption to the specific email address it was issued to. |
| **Tombstoning** | The process of replacing Personally Identifiable Information (PII) in immutable logs with a standard placeholder (e.g., `[GDPR ERASURE VERIFIED]`) to comply with data deletion requests while preserving audit integrity. |
| **Local Operator Profile** | A user profile consisting of basic identification data (name, contact/email) stored locally on the device, enabling access without external authentication services. |
| **Data Export** | The capability to extract all local shelter data into a portable format for backup or migration to future online versions of the platform. |
| **Offline-First MVP** | A minimum viable product designed to operate entirely on a single device without network connectivity, focused on validating core workflows before investing in cloud infrastructure. |
| **Shelter Context Switching** | The ability for the operator to switch the active shelter scope, redirecting all operations and views to the selected shelter's data. |

---

## 13. References

| Reference | Description |
| :--- | :--- |
| BRD_TEMPLATE.md | Official BRD template used as structural reference for this document. |
| Interview Session (v1) | Initial requirements gathering interview conducted with Helder Souza on 2026-07-08, session ID: b2380c32648c0da1e89001d4acba2599. |
| Interview Session (v2) | Gap analysis and second grilling session conducted on 2026-07-08 within conversation a1f7fef5-d577-49bf-9e65-bcd058dcf534. |
| Architect Feedback Sessions | Design decision reviews conducted on 2026-07-09 addressing authentication model, pet lifecycle, transfers, notifications, and shareable link policies. |

---

## 14. Appendix

### Appendix A — Pet Registration Data Model (Logical Fields)

| Field | Description | Notes |
| :--- | :--- | :--- |
| Name | The pet's given name at the shelter | Required |
| Date of Birth | Approximate or actual date of birth | Required |
| DOB Estimated | Flag indicating the date of birth is an estimate | Boolean; defaults to false |
| Species | e.g., Dog, Cat, Rabbit | Required |
| Breed / Race | Specific breed classification | Required |
| Sex | Male / Female | Required |
| Color / Markings | Physical appearance descriptor | Required |
| Intake Origin | Source of intake: Street Rescue, Owner Surrender, Transfer from Another Shelter, Born at Shelter, Other (+ free text) | Required |
| Health Conditions | Known diseases or conditions | e.g., FIV, FeLV, diabetes |
| Current Health Status | Active health state (Healthy, In Treatment, Recovering) | Required |
| Available for Adoption | Boolean flag indicating adoption availability | Toggled by staff |
| Outcome Status | Lifecycle outcome: Active, Adopted, Deceased, Transferred, In Foster | Defaults to Active |
| Media | Photos and/or videos of the pet | Optional; multiple files supported |

### Appendix B — Pet Care Event Data Model (Logical Fields)

| Field | Description | Notes |
| :--- | :--- | :--- |
| Care Modality | Type of care: Vaccine, Vermifuge, Medication, Physical Therapy, Hospitalization, Other | Required |
| Substance / Product Name | Name of the substance or product administered (e.g., Antirabies, Ivermectin) | Optional |
| Recurrence Interval | How frequently the care event repeats (hours/days/months/years) | Required for recurring events |
| End Date | Date on which a temporary treatment concludes | Optional; if left blank, the event repeats indefinitely until explicitly cancelled or the pet is archived |
| Treatment Instructions | Specific administration instructions (e.g., after meal) | Optional |
| Administered By | Staff member recording the event | Auto-captured |
| Date Administered | Date and time of care event | Required |
| Linked Appointment | Optional reference to a veterinary appointment | Optional; informational only |

### Appendix C — Inventory Item Data Model (Logical Fields)

| Field | Description | Notes |
| :--- | :--- | :--- |
| Item Name | Name of the supply or product | Required |
| Category | Food / Medication / Cleaning Supplies / Equipment / Other | Required |
| Quantity | Current quantity in stock | Required |
| Unit of Measure | e.g., units, kg, g, L, mL | Required |
| Purchase Date | Date the item was acquired | Required |
| Expiration Date | Date the item expires | Required where applicable |
| Description | Additional product details or usage notes | Optional |
| Alert Threshold | Configurable trigger value for low-stock notification | Per-item configuration |

### Appendix D — Adopter Details Data Model (Logical Fields)

| Field | Description | Notes |
| :--- | :--- | :--- |
| Adopter Name | Full name of the person adopting the pet | Required upon adoption |
| Phone | Contact phone number of the adopter | Required upon adoption |
| Address | Residential address of the adopter | Required upon adoption |
| Pet Reference | Link to the adopted pet's record | System-generated |
| Adoption Date | Date the adoption was recorded | Auto-captured |

### Appendix E — Shareable Link Configuration

| Parameter | Description | Options |
| :--- | :--- | :--- |
| Link Type | Determines data visibility scope | Adoption Profile / Veterinary Profile |
| TTL | Time-to-live duration | Configurable (e.g., 7 days, 30 days, 90 days); maximum 90 days |
| Renewable | Whether the link can be renewed before or after expiration | Yes |
| Status | Current link state | Active / Revoked / Expired |
| Revocation | Manual revocation by any authorized staff member | Available at any time |

### Appendix F — Notification Delivery Modes

| Mode | In-App | Email | Push Notification | Failure Handling |
| :--- | :--- | :--- | :--- | :--- |
| Standard | Yes | No | No | N/A |
| Custom | Yes | Optional (staff configured) | Optional (staff configured) | Retry up to 3 times; escalate to in-app banner on failure |

### Appendix G — MVP Phase Summary

| Phase | Version | Key Capabilities |
| :--- | :--- | :--- |
| MVP (Phase 1 — Offline Validation) | v1.0 | Local operator profile, multi-shelter management, shelter context switching, data export, pet registration and lifecycle management, vet directory, appointment logging (with retroactive warnings), care event recording, local in-app due-date alerts |
| Phase 2 | v1.1 | Inventory management, alert rules, usage templates, maintenance scheduling, two-tier notifications, failure escalation |
| Phase 3 (Online Foundation) | v1.2 | Google SSO authentication, multi-user support, staff invite links, RBAC, shareable pet profile links, configurable TTL, link revocation |
| Phase 4 | v1.3 | Proactive care event reminders, dashboard and reporting module, pet/inventory/maintenance/staff/link reports, search and filtering |
| Future | v2.0+ | Advanced analytics, internal transfer shadow records, appointment soft delete |
