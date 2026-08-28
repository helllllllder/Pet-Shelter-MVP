# Luna's Pet Central

An offline-first operations management system enabling a single operator to manage multiple independent animal shelters on a single device, providing full lifecycle pet tracking, clinical care scheduling, and structured data portability.

## Language

### Operator & Tenancy

**Operator**:
The single local individual registered on the device who manages one or more independent shelters.
_Avoid_: User, account, administrator, staff member

**Shelter**:
An independent operational organization and data container for animal rescue activities.
_Avoid_: Facility, branch, tenant, sanctuary profile

**Shelter Context**:
The currently selected shelter scope that restricts all queries, views, and record mutations to that specific shelter.
_Avoid_: Active session, workspace, active view, tenant environment

### Pet Profile & Lifecycle

**Pet**:
An individual animal registered and tracked within a specific shelter.
_Avoid_: Animal, patient, guest, resident

**Intake Origin**:
The documented source from which a pet arrived at the shelter (e.g., Street Rescue, Owner Surrender, Transfer, Born at Shelter, Other).
_Avoid_: Entry source, acquisition method, intake type

**Estimated DOB**:
A boolean indicator signifying that a pet's recorded date of birth is an approximate calculation rather than a verified date.
_Avoid_: Approximate age, guessed birthday, age estimate

**Available for Adoption**:
A boolean flag indicating that an active pet is ready and eligible for adoption placement.
_Avoid_: Up for adoption, adoptable flag, listing status

**Outcome**:
The terminal or transitional disposition of a pet (Adopted, Deceased, Transferred, In Foster) that archives the active profile while preserving complete historical records.
_Avoid_: Exit status, discharge, closure, status change

**In Foster**:
A reversible lifecycle state where a pet temporarily resides with a foster caregiver while remaining under active shelter responsibility.
_Avoid_: Temporary custody, fostered state, out on foster

**Adopter Details**:
The mandatory contact information (name, phone, address) captured for the person legally adopting a pet.
_Avoid_: Buyer info, customer record, adopter profile

**Shadow Record**:
An immutable, read-only historical record preserved at an originating shelter when a pet is transferred internally to another shelter.
_Avoid_: Historical clone, transfer copy, archive snapshot

### Veterinary & Clinical Care

**Vet Directory**:
A shelter-scoped registry of external veterinary clinics and licensed medical professionals.
_Avoid_: Clinic address book, doctor contacts, vet list

**Vet Appointment**:
A logged clinical consultation with a veterinarian from the directory, optionally holding attached diagnostic files and linked care events.
_Avoid_: Clinical visit, doctor consult, checkup

**Care Event**:
A scheduled treatment or healthcare protocol (Vaccine, Vermifuge, Medication, Physical Therapy, Hospitalization, Other) with defined recurrence rules.
_Avoid_: Treatment plan, medical task, medication order

**Care Occurrence**:
A single discrete instance of a care event scheduled for or administered on a specific due date.
_Avoid_: Treatment instance, dose log, care task

### Operations & Data Governance

**Data Export**:
A complete, structured JSON archive and asset bundle representing one or all shelters for backup and future cloud migration.
_Avoid_: Backup dump, database download, file extract

**Tombstoning**:
The cryptographic replacement of Personally Identifiable Information with a standard verified token in immutable audit logs following a GDPR deletion request.
_Avoid_: Row scrubbing, data erasure, hard deletion, record purge

**Audit Log**:
An append-only, tamper-evident record of all critical administrative, clinical, and lifecycle state changes.
_Avoid_: Event history, activity tracker, change log\n