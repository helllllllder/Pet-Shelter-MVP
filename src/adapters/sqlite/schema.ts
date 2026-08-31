import { sqliteTable, text, integer, index } from "drizzle-orm/sqlite-core";

/**
 * 1. Operator Profile (FR01)
 */
export const operatorProfileTable = sqliteTable("operator_profile", {
  id: text("id").primaryKey(),
  name: text("name").notNull(),
  email: text("email").notNull(),
  createdAt: text("created_at").notNull(),
  updatedAt: text("updated_at").notNull(),
});

/**
 * 2. Shelters (FR02, FR04)
 */
export const sheltersTable = sqliteTable(
  "shelters",
  {
    id: text("id").primaryKey(),
    name: text("name").notNull(),
    description: text("description"),
    isActive: integer("is_active", { mode: "boolean" }).notNull().default(true),
    createdAt: text("created_at").notNull(),
    updatedAt: text("updated_at").notNull(),
  },
  (table) => [
    index("idx_shelters_name").on(table.name),
    index("idx_shelters_active").on(table.isActive),
  ]
);

/**
 * 3. Pets (FR05, FR06, FR07, FR08)
 */
export const petsTable = sqliteTable(
  "pets",
  {
    id: text("id").primaryKey(),
    shelterId: text("shelter_id")
      .notNull()
      .references(() => sheltersTable.id, { onDelete: "cascade" }),
    name: text("name").notNull(),
    dob: text("dob").notNull(),
    isDobEstimated: integer("is_dob_estimated", { mode: "boolean" })
      .notNull()
      .default(false),
    species: text("species").notNull(),
    breed: text("breed").notNull(),
    sex: text("sex").notNull(),
    color: text("color").notNull(),
    intakeOrigin: text("intake_origin").notNull(),
    intakeOriginDetail: text("intake_origin_detail"),
    healthConditions: text("health_conditions"),
    healthStatus: text("health_status").notNull(),
    availableForAdoption: integer("available_for_adoption", { mode: "boolean" })
      .notNull()
      .default(false),
    outcomeStatus: text("outcome_status"),
    outcomeDate: text("outcome_date"),
    isArchived: integer("is_archived", { mode: "boolean" })
      .notNull()
      .default(false),
    createdAt: text("created_at").notNull(),
    updatedAt: text("updated_at").notNull(),
  },
  (table) => [
    index("idx_pets_shelter_id").on(table.shelterId),
    index("idx_pets_shelter_name").on(table.shelterId, table.name),
    index("idx_pets_shelter_species").on(table.shelterId, table.species),
    index("idx_pets_shelter_status").on(
      table.shelterId,
      table.outcomeStatus,
      table.isArchived
    ),
    index("idx_pets_shelter_adoption").on(
      table.shelterId,
      table.availableForAdoption
    ),
  ]
);

/**
 * 4. Pet Media (FR07, FR07-B)
 */
export const petMediaTable = sqliteTable(
  "pet_media",
  {
    id: text("id").primaryKey(),
    shelterId: text("shelter_id")
      .notNull()
      .references(() => sheltersTable.id, { onDelete: "cascade" }),
    petId: text("pet_id")
      .notNull()
      .references(() => petsTable.id, { onDelete: "cascade" }),
    mediaType: text("media_type").notNull(),
    filePath: text("file_path").notNull(),
    mimeType: text("mime_type").notNull(),
    fileSizeBytes: integer("file_size_bytes").notNull(),
    createdAt: text("created_at").notNull(),
  },
  (table) => [
    index("idx_pet_media_shelter").on(table.shelterId),
    index("idx_pet_media_pet").on(table.petId),
  ]
);

/**
 * 5. Adopter Details (FR09)
 */
export const adopterDetailsTable = sqliteTable(
  "adopter_details",
  {
    id: text("id").primaryKey(),
    shelterId: text("shelter_id")
      .notNull()
      .references(() => sheltersTable.id, { onDelete: "cascade" }),
    petId: text("pet_id")
      .notNull()
      .unique()
      .references(() => petsTable.id, { onDelete: "cascade" }),
    name: text("name").notNull(),
    phone: text("phone").notNull(),
    address: text("address").notNull(),
    createdAt: text("created_at").notNull(),
    updatedAt: text("updated_at").notNull(),
  },
  (table) => [
    index("idx_adopter_details_shelter").on(table.shelterId),
    index("idx_adopter_details_pet").on(table.petId),
  ]
);

/**
 * 6. Shadow Records (FR10)
 */
export const shadowRecordsTable = sqliteTable(
  "shadow_records",
  {
    id: text("id").primaryKey(),
    originShelterId: text("origin_shelter_id")
      .notNull()
      .references(() => sheltersTable.id, { onDelete: "restrict" }),
    destinationShelterId: text("destination_shelter_id")
      .notNull()
      .references(() => sheltersTable.id, { onDelete: "restrict" }),
    originPetId: text("origin_pet_id")
      .notNull()
      .references(() => petsTable.id, { onDelete: "restrict" }),
    destinationPetId: text("destination_pet_id")
      .notNull()
      .references(() => petsTable.id, { onDelete: "restrict" }),
    snapshotData: text("snapshot_data").notNull(),
    transferredAt: text("transferred_at").notNull(),
  },
  (table) => [
    index("idx_shadow_records_origin_shelter").on(table.originShelterId),
    index("idx_shadow_records_dest_shelter").on(table.destinationShelterId),
    index("idx_shadow_records_origin_pet").on(table.originPetId),
  ]
);

/**
 * 7. Veterinary Clinics (FR11)
 */
export const vetClinicsTable = sqliteTable(
  "vet_clinics",
  {
    id: text("id").primaryKey(),
    shelterId: text("shelter_id")
      .notNull()
      .references(() => sheltersTable.id, { onDelete: "cascade" }),
    name: text("name").notNull(),
    address: text("address"),
    phone: text("phone"),
    email: text("email"),
    isDeleted: integer("is_deleted", { mode: "boolean" })
      .notNull()
      .default(false),
    deletedAt: text("deleted_at"),
    createdAt: text("created_at").notNull(),
    updatedAt: text("updated_at").notNull(),
  },
  (table) => [
    index("idx_vet_clinics_shelter").on(table.shelterId),
    index("idx_vet_clinics_shelter_name").on(table.shelterId, table.name),
    index("idx_vet_clinics_deleted").on(table.shelterId, table.isDeleted),
  ]
);

/**
 * 8. Veterinarians (FR11)
 */
export const veterinariansTable = sqliteTable(
  "veterinarians",
  {
    id: text("id").primaryKey(),
    shelterId: text("shelter_id")
      .notNull()
      .references(() => sheltersTable.id, { onDelete: "cascade" }),
    clinicId: text("clinic_id")
      .notNull()
      .references(() => vetClinicsTable.id, { onDelete: "cascade" }),
    name: text("name").notNull(),
    specialization: text("specialization"),
    phone: text("phone"),
    email: text("email"),
    isDeleted: integer("is_deleted", { mode: "boolean" })
      .notNull()
      .default(false),
    deletedAt: text("deleted_at"),
    createdAt: text("created_at").notNull(),
    updatedAt: text("updated_at").notNull(),
  },
  (table) => [
    index("idx_veterinarians_shelter").on(table.shelterId),
    index("idx_veterinarians_clinic").on(table.clinicId),
    index("idx_veterinarians_shelter_name").on(table.shelterId, table.name),
    index("idx_veterinarians_deleted").on(table.shelterId, table.isDeleted),
  ]
);

/**
 * 9. Veterinary Appointments (FR12, FR14)
 */
export const vetAppointmentsTable = sqliteTable(
  "vet_appointments",
  {
    id: text("id").primaryKey(),
    shelterId: text("shelter_id")
      .notNull()
      .references(() => sheltersTable.id, { onDelete: "cascade" }),
    petId: text("pet_id")
      .notNull()
      .references(() => petsTable.id, { onDelete: "cascade" }),
    clinicId: text("clinic_id")
      .notNull()
      .references(() => vetClinicsTable.id, { onDelete: "restrict" }),
    veterinarianId: text("veterinarian_id").references(
      () => veterinariansTable.id,
      { onDelete: "set null" }
    ),
    appointmentDate: text("appointment_date").notNull(),
    isRetroactive: integer("is_retroactive", { mode: "boolean" })
      .notNull()
      .default(false),
    notes: text("notes").notNull(),
    isDeleted: integer("is_deleted", { mode: "boolean" })
      .notNull()
      .default(false),
    deletedAt: text("deleted_at"),
    createdAt: text("created_at").notNull(),
    updatedAt: text("updated_at").notNull(),
  },
  (table) => [
    index("idx_vet_appointments_shelter").on(table.shelterId),
    index("idx_vet_appointments_pet").on(table.petId, table.appointmentDate),
    index("idx_vet_appointments_clinic").on(table.clinicId),
    index("idx_vet_appointments_vet").on(table.veterinarianId),
    index("idx_vet_appointments_deleted").on(table.shelterId, table.isDeleted),
  ]
);

/**
 * 10. Veterinary Documents (FR13)
 */
export const vetDocumentsTable = sqliteTable(
  "vet_documents",
  {
    id: text("id").primaryKey(),
    shelterId: text("shelter_id")
      .notNull()
      .references(() => sheltersTable.id, { onDelete: "cascade" }),
    appointmentId: text("appointment_id")
      .notNull()
      .references(() => vetAppointmentsTable.id, { onDelete: "cascade" }),
    fileName: text("file_name").notNull(),
    filePath: text("file_path").notNull(),
    mimeType: text("mime_type").notNull(),
    fileSizeBytes: integer("file_size_bytes").notNull(),
    createdAt: text("created_at").notNull(),
  },
  (table) => [
    index("idx_vet_documents_shelter").on(table.shelterId),
    index("idx_vet_documents_appointment").on(table.appointmentId),
  ]
);

/**
 * 11. Care Events (FR15, FR16)
 */
export const careEventsTable = sqliteTable(
  "care_events",
  {
    id: text("id").primaryKey(),
    shelterId: text("shelter_id")
      .notNull()
      .references(() => sheltersTable.id, { onDelete: "cascade" }),
    petId: text("pet_id")
      .notNull()
      .references(() => petsTable.id, { onDelete: "cascade" }),
    appointmentId: text("appointment_id").references(
      () => vetAppointmentsTable.id,
      { onDelete: "set null" }
    ),
    modality: text("modality").notNull(),
    substance: text("substance"),
    instructions: text("instructions"),
    isRecurring: integer("is_recurring", { mode: "boolean" })
      .notNull()
      .default(false),
    recurrenceIntervalValue: integer("recurrence_interval_value"),
    recurrenceIntervalUnit: text("recurrence_interval_unit"),
    isTemporary: integer("is_temporary", { mode: "boolean" })
      .notNull()
      .default(false),
    startDate: text("start_date").notNull(),
    endDate: text("end_date"),
    status: text("status").notNull(),
    createdAt: text("created_at").notNull(),
    updatedAt: text("updated_at").notNull(),
  },
  (table) => [
    index("idx_care_events_shelter").on(table.shelterId),
    index("idx_care_events_pet").on(table.petId, table.status),
    index("idx_care_events_appointment").on(table.appointmentId),
    index("idx_care_events_modality").on(table.shelterId, table.modality),
  ]
);

/**
 * 12. Care Event Occurrences (FR17, FR18)
 */
export const careEventOccurrencesTable = sqliteTable(
  "care_event_occurrences",
  {
    id: text("id").primaryKey(),
    shelterId: text("shelter_id")
      .notNull()
      .references(() => sheltersTable.id, { onDelete: "cascade" }),
    careEventId: text("care_event_id")
      .notNull()
      .references(() => careEventsTable.id, { onDelete: "cascade" }),
    petId: text("pet_id")
      .notNull()
      .references(() => petsTable.id, { onDelete: "cascade" }),
    dueDate: text("due_date").notNull(),
    status: text("status").notNull(),
    completedAt: text("completed_at"),
    notes: text("notes"),
    createdAt: text("created_at").notNull(),
    updatedAt: text("updated_at").notNull(),
  },
  (table) => [
    index("idx_care_occurrences_shelter").on(table.shelterId),
    index("idx_care_occurrences_due").on(
      table.shelterId,
      table.status,
      table.dueDate
    ),
    index("idx_care_occurrences_event").on(table.careEventId),
    index("idx_care_occurrences_pet").on(table.petId, table.status),
  ]
);

/**
 * 13. Audit Logs (NFR13, NFR16)
 */
export const auditLogsTable = sqliteTable(
  "audit_logs",
  {
    id: text("id").primaryKey(),
    shelterId: text("shelter_id").references(() => sheltersTable.id, {
      onDelete: "set null",
    }),
    entityType: text("entity_type").notNull(),
    entityId: text("entity_id").notNull(),
    action: text("action").notNull(),
    actorType: text("actor_type").notNull(),
    actorId: text("actor_id").notNull(),
    details: text("details").notNull(),
    createdAt: text("created_at").notNull(),
  },
  (table) => [
    index("idx_audit_logs_shelter").on(table.shelterId),
    index("idx_audit_logs_entity").on(
      table.shelterId,
      table.entityType,
      table.entityId
    ),
    index("idx_audit_logs_created").on(table.shelterId, table.createdAt),
  ]
);
