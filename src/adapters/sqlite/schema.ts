import { sqliteTable, text, integer, index } from 'drizzle-orm/sqlite-core';

/**
 * 1. OPERATOR PROFILE (FR01)
 */
export const operatorProfile = sqliteTable('operator_profile', {
  id: text('id').primaryKey().notNull(), // UUIDv7
  fullName: text('full_name').notNull(),
  email: text('email').notNull(),
  phone: text('phone'),
  lastActiveShelterId: text('last_active_shelter_id'),
  deviceInstallId: text('device_install_id').notNull().unique(),
  createdAt: text('created_at').notNull(),
  updatedAt: text('updated_at').notNull(),
});

/**
 * 2. SHELTERS (FR02, FR04)
 */
export const shelters = sqliteTable('shelters', {
  id: text('id').primaryKey().notNull(), // UUIDv7
  name: text('name').notNull(),
  description: text('description'),
  address: text('address'),
  phone: text('phone'),
  email: text('email'),
  isActive: integer('is_active', { mode: 'boolean' }).notNull().default(true),
  createdAt: text('created_at').notNull(),
  updatedAt: text('updated_at').notNull(),
}, (table) => ({
  activeIdx: index('idx_shelters_active').on(table.isActive),
}));

/**
 * 3. PETS (FR05, FR06, FR07, FR08)
 */
export const pets = sqliteTable('pets', {
  id: text('id').primaryKey().notNull(), // UUIDv7
  shelterId: text('shelter_id').notNull().references(() => shelters.id, { onDelete: 'cascade' }),
  name: text('name').notNull(),
  species: text('species').notNull(), // 'CANINE', 'FELINE', 'OTHER'
  breed: text('breed').notNull(),
  sex: text('sex').notNull(), // 'MALE', 'FEMALE', 'UNKNOWN'
  color: text('color').notNull(),
  dateOfBirth: text('date_of_birth').notNull(), // YYYY-MM-DD
  isDobEstimated: integer('is_dob_estimated', { mode: 'boolean' }).notNull().default(false),
  intakeOrigin: text('intake_origin').notNull(),
  intakeOriginDetails: text('intake_origin_details'),
  healthStatus: text('health_status').notNull().default('HEALTHY'),
  healthConditions: text('health_conditions'), // JSON string array
  isAvailableForAdoption: integer('is_available_for_adoption', { mode: 'boolean' }).notNull().default(false),
  outcomeStatus: text('outcome_status').notNull().default('ACTIVE'),
  outcomeDate: text('outcome_date'),
  outcomeNotes: text('outcome_notes'),
  mediaReferences: text('media_references'), // JSON string array
  createdAt: text('created_at').notNull(),
  updatedAt: text('updated_at').notNull(),
  deletedAt: text('deleted_at'),
}, (table) => ({
  shelterOutcomeIdx: index('idx_pets_shelter_outcome').on(table.shelterId, table.outcomeStatus, table.deletedAt),
  shelterSpeciesIdx: index('idx_pets_shelter_species').on(table.shelterId, table.species),
  searchIdx: index('idx_pets_search').on(table.shelterId, table.name),
}));

/**
 * 4. ADOPTER DETAILS (FR09)
 */
export const adopterDetails = sqliteTable('adopter_details', {
  id: text('id').primaryKey().notNull(), // UUIDv7
  shelterId: text('shelter_id').notNull().references(() => shelters.id, { onDelete: 'cascade' }),
  petId: text('pet_id').notNull().unique().references(() => pets.id, { onDelete: 'cascade' }),
  adopterName: text('adopter_name').notNull(),
  adopterPhone: text('adopter_phone').notNull(),
  adopterAddress: text('adopter_address').notNull(),
  adoptedAt: text('adopted_at').notNull(),
  notes: text('notes'),
  createdAt: text('created_at').notNull(),
  updatedAt: text('updated_at').notNull(),
}, (table) => ({
  shelterIdx: index('idx_adopter_shelter').on(table.shelterId),
}));

/**
 * 5. SHADOW RECORDS (FR10)
 */
export const shadowRecords = sqliteTable('shadow_records', {
  id: text('id').primaryKey().notNull(), // UUIDv7
  originShelterId: text('origin_shelter_id').notNull().references(() => shelters.id, { onDelete: 'restrict' }),
  destinationShelterId: text('destination_shelter_id').notNull().references(() => shelters.id, { onDelete: 'restrict' }),
  originPetId: text('origin_pet_id').notNull().references(() => pets.id, { onDelete: 'restrict' }),
  destinationPetId: text('destination_pet_id').notNull().references(() => pets.id, { onDelete: 'restrict' }),
  transferredAt: text('transferred_at').notNull(),
  snapshotPayloadJson: text('snapshot_payload_json').notNull(),
  createdAt: text('created_at').notNull(),
}, (table) => ({
  originIdx: index('idx_shadow_origin').on(table.originShelterId, table.originPetId),
  destIdx: index('idx_shadow_dest').on(table.destinationShelterId, table.destinationPetId),
}));

/**
 * 6. VET CLINICS (FR11)
 */
export const vetClinics = sqliteTable('vet_clinics', {
  id: text('id').primaryKey().notNull(), // UUIDv7
  shelterId: text('shelter_id').notNull().references(() => shelters.id, { onDelete: 'cascade' }),
  name: text('name').notNull(),
  phone: text('phone').notNull(),
  email: text('email'),
  address: text('address').notNull(),
  emergencyServices: integer('emergency_services', { mode: 'boolean' }).notNull().default(false),
  notes: text('notes'),
  createdAt: text('created_at').notNull(),
  updatedAt: text('updated_at').notNull(),
  deletedAt: text('deleted_at'),
}, (table) => ({
  shelterNameIdx: index('idx_vet_clinics_shelter').on(table.shelterId, table.name),
}));

/**
 * 7. VETERINARIANS (FR11)
 */
export const veterinarians = sqliteTable('veterinarians', {
  id: text('id').primaryKey().notNull(), // UUIDv7
  shelterId: text('shelter_id').notNull().references(() => shelters.id, { onDelete: 'cascade' }),
  clinicId: text('clinic_id').notNull().references(() => vetClinics.id, { onDelete: 'cascade' }),
  name: text('name').notNull(),
  licenseNumber: text('license_number'),
  phone: text('phone'),
  email: text('email'),
  specialty: text('specialty'),
  createdAt: text('created_at').notNull(),
  updatedAt: text('updated_at').notNull(),
  deletedAt: text('deleted_at'),
}, (table) => ({
  shelterClinicIdx: index('idx_vets_shelter_clinic').on(table.shelterId, table.clinicId),
}));

/**
 * 8. VET APPOINTMENTS (FR12, FR14)
 */
export const vetAppointments = sqliteTable('vet_appointments', {
  id: text('id').primaryKey().notNull(), // UUIDv7
  shelterId: text('shelter_id').notNull().references(() => shelters.id, { onDelete: 'cascade' }),
  petId: text('pet_id').notNull().references(() => pets.id, { onDelete: 'cascade' }),
  clinicId: text('clinic_id').notNull().references(() => vetClinics.id, { onDelete: 'restrict' }),
  veterinarianId: text('veterinarian_id').references(() => veterinarians.id, { onDelete: 'set null' }),
  appointmentDate: text('appointment_date').notNull(),
  reason: text('reason').notNull(),
  diagnosis: text('diagnosis'),
  prognosis: text('prognosis'),
  isRetroactive: integer('is_retroactive', { mode: 'boolean' }).notNull().default(false),
  createdAt: text('created_at').notNull(),
  updatedAt: text('updated_at').notNull(),
  deletedAt: text('deleted_at'), // Soft-delete preserve linked care events
}, (table) => ({
  petApptIdx: index('idx_appointments_pet').on(table.shelterId, table.petId, table.appointmentDate),
  dateIdx: index('idx_appointments_date').on(table.shelterId, table.appointmentDate),
}));

/**
 * 9. VET DOCUMENTS (FR13)
 */
export const vetDocuments = sqliteTable('vet_documents', {
  id: text('id').primaryKey().notNull(), // UUIDv7
  shelterId: text('shelter_id').notNull().references(() => shelters.id, { onDelete: 'cascade' }),
  appointmentId: text('appointment_id').notNull().references(() => vetAppointments.id, { onDelete: 'cascade' }),
  fileName: text('file_name').notNull(),
  fileType: text('file_type').notNull(),
  fileSizeBytes: integer('file_size_bytes').notNull(),
  localRelativePath: text('local_relative_path').notNull(),
  sha256Checksum: text('sha256_checksum').notNull(),
  uploadedAt: text('uploaded_at').notNull(),
  createdAt: text('created_at').notNull(),
}, (table) => ({
  apptIdx: index('idx_vet_docs_appt').on(table.shelterId, table.appointmentId),
}));

/**
 * 10. CARE EVENTS (FR15, FR16)
 */
export const careEvents = sqliteTable('care_events', {
  id: text('id').primaryKey().notNull(), // UUIDv7
  shelterId: text('shelter_id').notNull().references(() => shelters.id, { onDelete: 'cascade' }),
  petId: text('pet_id').notNull().references(() => pets.id, { onDelete: 'cascade' }),
  linkedAppointmentId: text('linked_appointment_id').references(() => vetAppointments.id, { onDelete: 'set null' }),
  modality: text('modality').notNull(),
  substanceName: text('substance_name'),
  dosage: text('dosage'),
  administrationInstructions: text('administration_instructions'),
  recurrenceIntervalUnit: text('recurrence_interval_unit').notNull(),
  recurrenceIntervalValue: integer('recurrence_interval_value').notNull().default(0),
  startDate: text('start_date').notNull(),
  endDate: text('end_date'),
  status: text('status').notNull().default('ACTIVE'),
  createdAt: text('created_at').notNull(),
  updatedAt: text('updated_at').notNull(),
}, (table) => ({
  petStatusIdx: index('idx_care_events_pet').on(table.shelterId, table.petId, table.status),
}));

/**
 * 11. CARE EVENT OCCURRENCES (FR17, FR18)
 */
export const careEventOccurrences = sqliteTable('care_event_occurrences', {
  id: text('id').primaryKey().notNull(), // UUIDv7
  shelterId: text('shelter_id').notNull().references(() => shelters.id, { onDelete: 'cascade' }),
  careEventId: text('care_event_id').notNull().references(() => careEvents.id, { onDelete: 'cascade' }),
  petId: text('pet_id').notNull().references(() => pets.id, { onDelete: 'cascade' }),
  dueDate: text('due_date').notNull(),
  status: text('status').notNull().default('SCHEDULED'),
  administeredAt: text('administered_at'),
  administeredByOperatorName: text('administered_by_operator_name'),
  notes: text('notes'),
  createdAt: text('created_at').notNull(),
  updatedAt: text('updated_at').notNull(),
}, (table) => ({
  dueIdx: index('idx_occurrences_due').on(table.shelterId, table.status, table.dueDate),
  petDueIdx: index('idx_occurrences_pet').on(table.shelterId, table.petId, table.dueDate),
}));

/**
 * 12. AUDIT LOGS (NFR13, NFR16)
 */
export const auditLogs = sqliteTable('audit_logs', {
  id: text('id').primaryKey().notNull(), // UUIDv7
  shelterId: text('shelter_id'),
  entityType: text('entity_type').notNull(),
  entityId: text('entity_id').notNull(),
  action: text('action').notNull(),
  actorName: text('actor_name').notNull(),
  actorContact: text('actor_contact'),
  payloadDiffJson: text('payload_diff_json'),
  ipOrDeviceId: text('ip_or_device_id').notNull(),
  createdAt: text('created_at').notNull(),
}, (table) => ({
  shelterEntityIdx: index('idx_audit_shelter_entity').on(table.shelterId, table.entityType, table.entityId),
  createdIdx: index('idx_audit_created').on(table.createdAt),
}));
