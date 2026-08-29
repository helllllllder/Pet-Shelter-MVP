# 📖 Pet Shelter Management Application — Operator & User Manual

## Overview & Architecture

The **Pet Shelter Management System** is a 100% offline-first, local-native application designed for animal shelters, rescue centers, and foster networks operating in environments with intermittent or zero internet connectivity.

---

## Table of Contents
1. [Getting Started & Operator Profiles](#1-getting-started--operator-profiles)
2. [Multi-Shelter Management & Context Isolation](#2-multi-shelter-management--context-isolation)
3. [Pet Lifecycle & Intake Management](#3-pet-lifecycle--intake-management)
4. [Adoptions & Outcome Processing](#4-adoptions--outcome-processing)
5. [Veterinary Directory & Health Records](#5-veterinary-directory--health-records)
6. [Care Events & Recurrence Engine](#6-care-events--recurrence-engine)
7. [Categorized Inventory Management](#7-categorized-inventory-management)
8. [Inventory Alert Rules & Expiration Proximity](#8-inventory-alert-rules--expiration-proximity)
9. [1-Click Inventory Usage Templates](#9-1-click-inventory-usage-templates)
10. [Facility Maintenance Scheduling & Logs](#10-facility-maintenance-scheduling--logs)
11. [Two-Tier Notification System & Retry Escalation](#11-two-tier-notification-system--retry-escalation)
12. [Audit Logging, GDPR Privacy & Data Export](#12-audit-logging-gdpr-privacy--data-export)

---

## 1. Getting Started & Operator Profiles
### Requirements & First Launch
- The app operates completely locally on Android, iOS, or Desktop.
- On first launch, the **Operator Profile Modal** prompts for:
  - **Full Name** (e.g., *Alex Rivera*)
  - **Email Address** (e.g., *alex@shelter.org*)
  - **Phone Number** (Optional)
- Your device is assigned a cryptographically unique `device_install_id` (UUIDv7). Subsequent launches automatically authenticate without requiring an internet connection.

---

## 2. Multi-Shelter Management & Context Isolation
### Managing Multiple Facilities
- Operators can register and manage multiple distinct shelters from a single device.
- Shelters can share identical names without conflict (each shelter maintains a unique UUIDv7).
- The active shelter is selected via the global navigation header.
- **Strict Data Isolation**: All pets, appointments, inventory, and tasks are strictly scoped to the active shelter. Switching shelters immediately purges in-memory caches and re-scopes all database queries.
- **Dirty State Protection**: If you have unsaved form entries and attempt to switch shelters, the app presents a blocking confirmation dialog preventing accidental data loss.

---

## 3. Pet Lifecycle & Intake Management
### Animal Registration
When adding a new pet to the facility, capture:
- **Identification**: Name, Microchip Number, Collar ID.
- **Demographics**: Species (`CANINE`, `FELINE`, `AVIAN`, `SMALL_FURRY`, `REPTILE`, `OTHER`), Breed, Biological Sex, Primary Color/Markings.
- **Age Tracking**: Exact Date of Birth or Estimated Age (the app automatically tags estimated dates with an `is_dob_estimated` indicator).
- **Intake Category**: Stray, Owner Surrender, Law Enforcement Confiscation, Rescue Transfer, Born in Shelter.

---

## 4. Adoptions & Outcome Processing
### Recording Adoptions & Outcomes
When an animal exits active shelter care:
1. Navigate to the pet profile and select **Process Outcome**.
2. Select Outcome Status: `ADOPTED`, `TRANSFERRED`, `FOSTERED`, `DECEASED`, or `EUTHANIZED`.
3. For adoptions, capture legal adopter details:
   - Adopter Full Legal Name
   - Phone Number & Verified Email
   - Residential Address
   - Identification Document Number & Adoption Fee
4. The pet is marked inactive in adoption directories while retaining complete immutable medical history.

---

## 5. Veterinary Directory & Health Records
### Directory & Appointments
- Maintain an offline directory of veterinary clinics and licensed veterinarians with emergency after-hours contacts.
- **Schedule Checkups**: Book routine examinations, surgical procedures, dental cleanings, or lab diagnostics.
- **Retroactive Logging**: Document emergency vet visits that occurred off-site, attaching veterinary diagnostic notes and file attachments (verified with SHA-256 checksums).

---

## 6. Care Events & Recurrence Engine
### Medical & Daily Care Protocols
- Schedule care modalities: `MEDICATION`, `VACCINATION`, `DEWORMING`, `SURGICAL_CHECK`, `GROOMING`, `SPECIAL_DIET`.
- **Recurrence Engine**: Supports flexible recurring schedules (`DAILY`, `WEEKLY`, `MONTHLY`, `YEARLY`).
- **Due Date Calculation**: The app projects upcoming occurrences and displays badge notifications for treatments due within 24 hours or overdue.

---

## 7. Categorized Inventory Management
### Stock Tracking
Manage inventory across 5 standard categories:
- 🥫 **FOOD**: Kibble, canned food, milk replacers, prescription diets.
- 💊 **MEDICATION**: Antibiotics, vaccines, pain management, antiparasitics.
- 🧼 **CLEANING SUPPLIES**: Disinfectants, bleach, laundry detergent, kennel sprays.
- 🩺 **EQUIPMENT**: Syringes, thermometers, bandages, microchip scanners.
- 📦 **OTHER**: Bedding, toys, collars, leashes.

**Supported Units of Measure**: `KG`, `G`, `L`, `ML`, `UNITS`, `BOXES`, `DOSES`.

---

## 8. Inventory Alert Rules & Expiration Proximity
### Automated Stock Alerts
Configure dynamic alert rules per inventory item:
1. **Low Stock Threshold**: Triggers an alert when quantity falls to or below a specified threshold (e.g., $\le 10	ext{ doses}$).
2. **Expiration Window**: Triggers an alert when an item's expiration date is within $N$ days (e.g., alert 30 days before expiration).
- Alert evaluations execute in real-time in under 50ms without network overhead.

---

## 9. 1-Click Inventory Usage Templates
### Atomic Care Decrements
- Bundle commonly paired supplies into **Usage Templates** (e.g., *"Routine Canine Intake Pack"* = 1 Rabies Vaccine + 1 Syringe + 1 Dewormer Dose).
- When administering care to a pet, select the template to decrement all constituent items atomically from inventory in a single click, eliminating manual math.

---

## 10. Facility Maintenance Scheduling & Logs
### Maintaining Safe Shelter Conditions
- Create tasks under 3 categories:
  - 🔧 **REPAIR**: Broken kennel latches, HVAC repairs, plumbing leaks.
  - 🛡️ **PREVENTIVE MAINTENANCE**: Generator load tests, fire extinguisher inspections.
  - 🧹 **CLEANING**: Isolation ward deep disinfection, outdoor yard sanitization.
- Support recurring maintenance schedules with assignee tracking.
- **Completion Logs**: Record completion timestamp, operator name, and notes. Overdue tasks trigger high-priority dashboard badge warnings.

---

## 11. Two-Tier Notification System & Retry Escalation
### Communication Delivery Architecture
- **Standard Tier**: In-app notifications (due care events, low stock warnings, overdue tasks) delivered immediately (<5s).
- **Custom Tier**: Multi-channel messages (email, SMS, push) queued for external delivery.
- **3-Retry State Machine**: If external delivery fails, the app retries up to 3 times with exponential backoff.
- **Emergency In-App Escalation**: If all 3 retries fail, the system transitions the notification to `ESCALATED` and surfaces a prominent emergency banner on the operator dashboard with 1-click dismissal.

---

## 12. Audit Logging, GDPR Privacy & Data Export
### Compliance, Privacy & Data Portability
- **Tamper-Evident Audit Log**: Every database mutation (inserts, updates, outcome changes) is recorded in an append-only audit trail with UTC timestamp and operator ID.
- **GDPR Right to Erasure**: Execute one-click PII tombstoning on adopter records (`[GDPR ERASURE VERIFIED]`) while preserving historical animal care logs.
- **Structured JSON Data Export**: Export shelter data into a standard `v1.0.0` JSON envelope complete with SHA-256 cryptographic checksums for offline backup and migration.
