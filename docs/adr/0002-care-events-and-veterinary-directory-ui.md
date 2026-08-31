# ADR 0002: Mobile UI Flows for Veterinary Directory & Care Event Engine

## Status
Accepted

## Context
Phase 1 established backend services and data contracts for the Veterinary Directory (`Clinic`, `Veterinarian`, `Appointment`) and Care Engine (`CareEvent`, `CareOccurrence`, `RecurrenceRule`). However, the mobile client lacked user-facing interfaces to register clinics/vets and schedule/complete care occurrences.

Operators need intuitive mobile interfaces to:
1. Register external partner veterinary clinics and attending veterinarians.
2. Schedule both one-off and recurring care events (Vaccine, Medication, Vermifuge, Grooming, PhysicalTherapy) either directly from a pet's profile or shelter-wide.
3. Mark care occurrences as Completed (recording execution timestamp and notes) or Skipped (with operational reason).

## Decision
1. **Dual Entry Points for Care Events**:
   - **Pet Profile Seam**: A primary action button `+ Add Care Event` on `PetDetailScreen` opens the scheduling modal with `petId` pre-populated.
   - **Shelter-Wide Care Schedule**: A floating action button on `CareScheduleScreen` with a pet selector dropdown to schedule care across any active animal in the shelter.
2. **Dedicated Veterinary Directory (`VetDirectoryScreen`)**:
   - Tabbed or card layout displaying registered Clinics and their affiliated Veterinarians.
   - Modal for `Register Veterinary Clinic` and `Add Veterinarian to Clinic`.
3. **Occurrence Execution**:
   - Actionable occurrence list on both `PetDetailScreen` and `CareScheduleScreen` with `✓ Complete` and `✕ Skip` quick actions.
4. **Zustand State Stores**:
   - `useVetStore`: Manages clinics and veterinarians scoped to the active shelter.
   - `useCareStore`: Manages care events and projected occurrences with instant reactive recalculation of due/overdue items.

## Consequences

### Positive
- Direct operational alignment with the Ubiquitous Language in `CONTEXT.md` (`Veterinary Clinic`, `Veterinarian`, `Care Event`, `Modality`, `Substance`, `Recurring Care Event`, `Temporary Care Event`).
- Live synchronization of Dashboard KPIs (`Due Care Events`, `Overdue Care Events`).
- Full offline UX usability without requiring manual backend CLI or testing seeds.
