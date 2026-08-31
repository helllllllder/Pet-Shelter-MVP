# ADR 0001: First-Launch Operator & Shelter Onboarding Wizard

## Status
Accepted

## Context
Luna's Pet Central is an offline-first animal shelter management system. On a fresh installation, the local database contains no Operator profile and no Shelter instances. 

The Phase 1 specification defines requirements for Operator registration and multiple Shelter scoping, but does not prescribe the UX flow for initial app bootstrap. Without an active Shelter Context and registered Operator, core features (such as pet registration, veterinary directory management, and care scheduling) cannot function because all domain records require an active `shelterId`.

## Decision
We introduce a lightweight, modal **First-Launch Onboarding Wizard** in the mobile UI shell:
1. **Detection Gate**: When the application loads, the app shell checks if an Operator profile and at least one Shelter exist.
2. **Step 1 - Operator Onboarding**: Prompts the user to register as the device Operator with their `Name` and `Email`.
3. **Step 2 - Initial Shelter Setup**: Prompts the Operator to name and describe their first `Shelter`.
4. **Context Activation**: On submission, the new Shelter is persisted and automatically set as the active `Shelter Context`, unlocking the full Dashboard and navigation drawer.
5. **Subsequent Modifications**: After onboarding, the Operator can update their details in the `Operator & Settings` screen and create additional shelters via the `Shelter Context Switcher` modal.

## Consequences

### Positive
- **Guaranteed Invariants**: Ensures all downstream domain entities (Pets, Clinics, Appointments, Care Events) are always created within a valid, active Shelter Context.
- **Zero Orphaned Data**: Prevents runtime null-pointer exceptions or empty-context edge cases.
- **Seamless UX**: Provides clear guidance on first launch instead of an unpopulated dashboard with inert controls.

### Neutral / Trade-offs
- Adds a required initial flow on the very first application launch before the Operator can view the empty Dashboard.
