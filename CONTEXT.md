# Ubiquitous Language Glossary & Domain Concepts

## Core Actors & Identity
- **Operator**: The human user operating the device locally on behalf of one or more shelters.
- **Shelter**: An independent local data container representing an animal rescue organization, facility, or branch.
- **Active Shelter Context**: The currently selected shelter container whose data is actively loaded, queried, and mutated.
- **Device Install ID**: A UUIDv7 generated upon initial app startup identifying the physical local installation.

## Pet Management
- **Pet Profile**: The authoritative operational record of an individual animal under shelter care.
- **Estimated Date of Birth (DOB)**: An indicator flag (`is_dob_estimated`) denoting that a pet's birthday was approximated upon rescue intake.
- **Intake Origin**: The historical origin category of a pet (`STREET_RESCUE`, `OWNER_SURRENDER`, `TRANSFER_INTERNAL`, `TRANSFER_EXTERNAL`, `BORN_IN_SHELTER`, `OTHER`).
- **Pet Outcome**: The terminal or non-terminal disposition state of a pet (`ACTIVE`, `IN_FOSTER`, `ADOPTED`, `DECEASED`, `TRANSFERRED_INTERNAL`, `TRANSFERRED_EXTERNAL`).
- **In Foster**: A reversible non-archived state where an animal remains under shelter custody but resides in a temporary foster home.
- **Adopter Details**: Personally Identifiable Information (PII) captured upon adoption (Name, Phone, Address).
- **Shadow Record**: An immutable, read-only replica of a pet's history preserved at the originating shelter during an internal transfer.

## Veterinary & Medical Care
- **Vet Clinic**: A veterinary hospital or clinic facility scoped to the active shelter.
- **Veterinarian**: An individual practitioner linked to a specific clinic.
- **Vet Appointment**: A medical consultation record linked to a pet, clinic, and optional veterinarian.
- **Retroactive Appointment**: An appointment logged with a historical past timestamp, requiring explicit operator confirmation.
- **Care Event**: A scheduled or recurring medical/husbandry treatment (`VACCINE`, `VERMIFUGE`, `MEDICATION`, `PHYSICAL_THERAPY`, `HOSPITALIZATION`, `OTHER`).
- **Care Occurrence**: An individual scheduled instance of a recurring care event with a specific due date and completion status (`SCHEDULED`, `ADMINISTERED`, `MISSED`, `CANCELLED`).

## Phase 2: Inventory & Maintenance Operations
- **Inventory Item**: A tracked physical resource belonging to a shelter, classified under a strict category (`FOOD`, `MEDICATION`, `CLEANING_SUPPLIES`, `EQUIPMENT`, `OTHER`).
- **Unit of Measure (UoM)**: The standard quantity unit used for inventory tracking (`UNITS`, `KG`, `G`, `L`, `ML`).
- **Inventory Alert Rule**: A declarative rule that triggers an in-app operational warning when stock quantity falls below a threshold, reaches an estimated depletion date, or approaches expiration within a defined window.
- **Inventory Usage Template**: A pre-configured bundle of items and quantities that can be decremented in a single atomic transaction during care event recording (e.g., "Standard Puppy Vaccination Pack" -> 1 dose vaccine, 1 syringe, 1 alcohol wipe).
- **Maintenance Task**: A facility maintenance or equipment care task classified by type (`REPAIR`, `PREVENTIVE_MAINTENANCE`, `CLEANING`), with scheduled dates, optional recurrence, and optional staff assignment.
- **Task Completion Log**: An immutable record logging the exact timestamp, completion notes, and operator identity when a maintenance task is marked done.

## Phase 2: Notification Tiers & Reliability
- **Standard Notification Tier**: Fast local in-app alert delivered directly to the operator's active screen/tray within <5 seconds.
- **Custom Notification Tier**: Configurable external notification channel (Email / Push notification) for multi-channel alerting.
- **Delivery State Machine**: The lifecycle state of a notification (`PENDING`, `DELIVERED`, `FAILED`, `ESCALATED`).
- **Escalation Banner**: An emergency in-app banner rendered on screen when an external notification fails delivery after 3 retry attempts with exponential backoff.

## Data Governance & Privacy
- **Audit Log**: An append-only, tamper-evident log capturing entity mutations (`CREATE`, `UPDATE`, `DELETE`, `OUTCOME_CHANGE`, `INVENTORY_ADJUSTMENT`, `GDPR_ERASURE`).
- **Tombstoning**: Replacing personal identifiable information with `[GDPR ERASURE VERIFIED]` while preserving log structure and referential integrity.
