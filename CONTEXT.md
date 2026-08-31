# Luna's Pet Central

Luna's Pet Central is an operations management system for animal shelters that unifies pet intake, medical care, veterinary coordination, and shelter administration into a single source of truth.

## Language

### Operator & Facility Management

**Operator**:
The single local individual responsible for managing shelters, pets, and administrative data on a device.
_Avoid_: User, staff member, account holder, admin

**Shelter**:
An independent operational facility and data container managing its own animals, veterinary directory, appointments, and care records.
_Avoid_: Facility, branch, tenant, organization

**Shelter Context**:
The active shelter scope currently selected by the operator to isolate all data views, searches, and operations.
_Avoid_: Active workspace, session shelter, active profile

### Pet Demographics & Status

**Pet Profile**:
The authoritative demographic and medical record for an animal managed by a shelter.
_Avoid_: Animal record, patient file, pet entry

**Intake Origin**:
The recorded source or circumstance through which an animal entered the shelter.
_Avoid_: Arrival source, intake method, acquisition type

**Estimated Date of Birth**:
An approximate birth date recorded for an animal whose exact birthdate is unknown.
_Avoid_: Approximate age, guessed birthday

**Available for Adoption**:
A boolean status designating whether an active animal is eligible for public adoption consideration.
_Avoid_: Adoptable, listed, public flag

**In Foster**:
A non-terminal, reversible placement status where an animal temporarily resides with an external caretaker while remaining under shelter responsibility.
_Avoid_: Fostered, temporary placement, offsite pet

**Archived Pet**:
A pet profile transitioned to a permanent historical state following a terminal outcome (Adopted, Deceased, or Transferred External).
_Avoid_: Inactive pet, closed pet, deleted pet

**Adopted**:
A terminal pet outcome indicating that legal custody and care of the animal have been permanently transferred to an adopter.
_Avoid_: Rehomed, placed

**Deceased**:
A terminal pet outcome indicating that the animal has died.
_Avoid_: Dead, expired, terminated

**Transferred (External)**:
A terminal pet outcome where an animal is permanently relocated to an external organization outside the system.
_Avoid_: Out-transferred, external relocation

**Adopter**:
The individual who assumes permanent custody of an adopted animal, whose contact details are recorded upon adoption.
_Avoid_: Owner, buyer, client, customer

### Veterinary Care & Directory

**Veterinary Directory**:
A shelter-scoped registry of external veterinary clinics and affiliated veterinary professionals.
_Avoid_: Vet list, doctor address book, clinic catalog

**Veterinary Clinic**:
An external medical facility or hospital registered in the veterinary directory that provides clinical services to shelter animals.
_Avoid_: Hospital, vet office, practice, partner clinic

**Veterinarian**:
A licensed medical professional registered within the veterinary directory and linked to a specific clinic.
_Avoid_: Vet doctor, medical professional, practitioner

**Veterinary Appointment**:
A scheduled or historical clinical visit for a pet conducted by a specific veterinarian at a veterinary clinic.
_Avoid_: Vet visit, medical consultation, booking

**Veterinary Document**:
A clinical file or diagnostic attachment associated with a veterinary appointment.
_Avoid_: Medical attachment, clinical file, exam paper

### Care & Treatment

**Care Event**:
A discrete scheduled or administered health procedure, treatment, or wellness action for a pet.
_Avoid_: Task, treatment log, medical action

**Modality**:
The clinical category of a care event, such as Vaccine, Vermifuge, Medication, Physical Therapy, or Grooming.
_Avoid_: Care type, treatment kind, intervention category

**Substance**:
The specific medication, vaccine, or therapeutic agent administered during a care event.
_Avoid_: Medicine, medication name, drug product

**Recurring Care Event**:
A care event configured to repeat automatically at set intervals until explicitly cancelled or concluded.
_Avoid_: Routine schedule, periodic treatment

**Temporary Care Event**:
A time-bounded treatment course that automatically concludes after a specified end date.
_Avoid_: Acute treatment, finite prescription, temporary treatment

### Extended Operations & Collaboration

**Shadow Record**:
A read-only historical copy of a pet record retained by the originating shelter after an internal transfer to another shelter.
_Avoid_: Ghost profile, stub record, mirror pet

**Shareable Link**:
A time-limited, access-controlled web link providing external parties view-only access to a pet's adoption or veterinary profile.
_Avoid_: Public link, guest token, shared URL

**Inventory Item**:
A tracked physical supply or consumable item managed within a shelter by quantity, unit of measure, and expiration date.
_Avoid_: Stock item, product, consumable

**Maintenance Task**:
A scheduled facility upkeep, cleaning, or repair activity within a shelter.
_Avoid_: Chore, shelter task, repair job