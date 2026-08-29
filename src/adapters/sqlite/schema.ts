import { sqliteTable, text, integer, real, index } from 'drizzle-orm/sqlite-core';

// 1. Operator Profile
export const operatorProfile = sqliteTable('operator_profile', {
  id: text('id').primaryKey(),
  fullName: text('full_name').notNull(),
  email: text('email').notNull(),
  phone: text('phone'),
  lastActiveShelterId: text('last_active_shelter_id'),
  deviceInstallId: text('device_install_id').notNull(),
  createdAt: text('created_at').notNull(),
  updatedAt: text('updated_at').notNull(),
});

// 2. Shelters
export const shelters = sqliteTable('shelters', {
  id: text('id').primaryKey(),
  name: text('name').notNull(),
  description: text('description'),
  address: text('address'),
  phone: text('phone'),
  email: text('email'),
  isActive: integer('is_active', { mode: 'boolean' }).notNull().default(true),
  createdAt: text('created_at').notNull(),
  updatedAt: text('updated_at').notNull(),
});

// 3. Pets
export const pets = sqliteTable(
  'pets',
  {
    id: text('id').primaryKey(),
    shelterId: text('shelter_id').notNull().references(() => shelters.id, { onDelete: 'cascade' }),
    name: text('name').notNull(),
    species: text('species').notNull(),
    breed: text('breed').notNull(),
    sex: text('sex').notNull(),
    color: text('color').notNull(),
    dateOfBirth: text('date_of_birth').notNull(),
    isDobEstimated: integer('is_dob_estimated', { mode: 'boolean' }).notNull().default(false),
    intakeOrigin: text('intake_origin').notNull(),
    intakeOriginDetails: text('intake_origin_details'),
    healthStatus: text('health_status').notNull().default('HEALTHY'),
    healthConditions: text('health_conditions').notNull().default('[]'),
    isAvailableForAdoption: integer('is_available_for_adoption', { mode: 'boolean' }).notNull().default(false),
    outcomeStatus: text('outcome_status').notNull().default('ACTIVE'),
    outcomeDate: text('outcome_date'),
    outcomeNotes: text('outcome_notes'),
    mediaReferences: text('media_references').notNull().default('[]'),
    createdAt: text('created_at').notNull(),
    updatedAt: text('updated_at').notNull(),
    deletedAt: text('deleted_at'),
  },
  (table) => ({
    shelterIdx: index('pets_shelter_id_idx').on(table.shelterId),
    outcomeStatusIdx: index('pets_outcome_status_idx').on(table.outcomeStatus),
    nameIdx: index('pets_name_idx').on(table.name),
  })
);

// 4. Adopter Details
export const adopterDetails = sqliteTable('adopter_details', {
  id: text('id').primaryKey(),
  shelterId: text('shelter_id').notNull().references(() => shelters.id, { onDelete: 'cascade' }),
  petId: text('pet_id').notNull().references(() => pets.id, { onDelete: 'cascade' }),
  adopterName: text('adopter_name').notNull(),
  adopterPhone: text('adopter_phone').notNull(),
  adopterAddress: text('adopter_address').notNull(),
  adoptedAt: text('adopted_at').notNull(),
  notes: text('notes'),
  createdAt: text('created_at').notNull(),
  updatedAt: text('updated_at').notNull(),
});

// 5. Shadow Records
export const shadowRecords = sqliteTable('shadow_records', {
  id: text('id').primaryKey(),
  originalShelterId: text('original_shelter_id').notNull().references(() => shelters.id, { onDelete: 'cascade' }),
  targetShelterId: text('target_shelter_id').notNull().references(() => shelters.id, { onDelete: 'cascade' }),
  originalPetId: text('original_pet_id').notNull().references(() => pets.id, { onDelete: 'cascade' }),
  newPetId: text('new_pet_id').notNull().references(() => pets.id, { onDelete: 'cascade' }),
  snapshotDataJson: text('snapshot_data_json').notNull(),
  transferredAt: text('transferred_at').notNull(),
});

// 6. Vet Clinics
export const vetClinics = sqliteTable('vet_clinics', {
  id: text('id').primaryKey(),
  shelterId: text('shelter_id').notNull().references(() => shelters.id, { onDelete: 'cascade' }),
  name: text('name').notNull(),
  phone: text('phone'),
  email: text('email'),
  address: text('address'),
  emergencyServices: integer('emergency_services', { mode: 'boolean' }).notNull().default(false),
  notes: text('notes'),
  createdAt: text('created_at').notNull(),
  updatedAt: text('updated_at').notNull(),
  deletedAt: text('deleted_at'),
});

// 7. Veterinarians
export const veterinarians = sqliteTable('veterinarians', {
  id: text('id').primaryKey(),
  shelterId: text('shelter_id').notNull().references(() => shelters.id, { onDelete: 'cascade' }),
  clinicId: text('clinic_id').notNull().references(() => vetClinics.id, { onDelete: 'cascade' }),
  fullName: text('full_name').notNull(),
  licenseNumber: text('license_number'),
  phone: text('phone'),
  email: text('email'),
  specialization: text('specialization'),
  createdAt: text('created_at').notNull(),
  updatedAt: text('updated_at').notNull(),
  deletedAt: text('deleted_at'),
});

// 8. Vet Appointments
export const vetAppointments = sqliteTable('vet_appointments', {
  id: text('id').primaryKey(),
  shelterId: text('shelter_id').notNull().references(() => shelters.id, { onDelete: 'cascade' }),
  petId: text('pet_id').notNull().references(() => pets.id, { onDelete: 'cascade' }),
  clinicId: text('clinic_id').notNull().references(() => vetClinics.id, { onDelete: 'cascade' }),
  veterinarianId: text('veterinarian_id').references(() => veterinarians.id, { onDelete: 'set null' }),
  appointmentDate: text('appointment_date').notNull(),
  reason: text('reason').notNull(),
  diagnosis: text('diagnosis'),
  prognosis: text('prognosis'),
  isRetroactive: integer('is_retroactive', { mode: 'boolean' }).notNull().default(false),
  createdAt: text('created_at').notNull(),
  updatedAt: text('updated_at').notNull(),
  deletedAt: text('deleted_at'),
});

// 9. Vet Documents
export const vetDocuments = sqliteTable('vet_documents', {
  id: text('id').primaryKey(),
  shelterId: text('shelter_id').notNull().references(() => shelters.id, { onDelete: 'cascade' }),
  appointmentId: text('appointment_id').notNull().references(() => vetAppointments.id, { onDelete: 'cascade' }),
  fileName: text('file_name').notNull(),
  fileType: text('file_type').notNull(),
  fileSizeBytes: integer('file_size_bytes').notNull(),
  localRelativePath: text('local_relative_path').notNull(),
  sha256Checksum: text('sha256_checksum').notNull(),
  uploadedAt: text('uploaded_at').notNull(),
});

// 10. Care Events
export const careEvents = sqliteTable('care_events', {
  id: text('id').primaryKey(),
  shelterId: text('shelter_id').notNull().references(() => shelters.id, { onDelete: 'cascade' }),
  petId: text('pet_id').notNull().references(() => pets.id, { onDelete: 'cascade' }),
  linkedAppointmentId: text('linked_appointment_id').references(() => vetAppointments.id, { onDelete: 'set null' }),
  modality: text('modality').notNull(),
  substanceName: text('substance_name'),
  dosage: text('dosage'),
  administrationInstructions: text('administration_instructions'),
  recurrenceIntervalUnit: text('recurrence_interval_unit').notNull().default('NONE'),
  recurrenceIntervalValue: integer('recurrence_interval_value').notNull().default(0),
  startDate: text('start_date').notNull(),
  endDate: text('end_date'),
  status: text('status').notNull().default('ACTIVE'),
  createdAt: text('created_at').notNull(),
  updatedAt: text('updated_at').notNull(),
});

// 11. Care Event Occurrences
export const careEventOccurrences = sqliteTable('care_event_occurrences', {
  id: text('id').primaryKey(),
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
});

// 12. Audit Logs
export const auditLogs = sqliteTable('audit_logs', {
  id: text('id').primaryKey(),
  shelterId: text('shelter_id').references(() => shelters.id, { onDelete: 'cascade' }),
  entityType: text('entity_type').notNull(),
  entityId: text('entity_id').notNull(),
  action: text('action').notNull(),
  actorName: text('actor_name').notNull(),
  actorContact: text('actor_contact'),
  payloadDiffJson: text('payload_diff_json'),
  ipOrDeviceId: text('ip_or_device_id').notNull(),
  createdAt: text('created_at').notNull(),
});

// --- Phase 2 Additions ---

// 13. Inventory Items
export const inventoryItems = sqliteTable(
  'inventory_items',
  {
    id: text('id').primaryKey(),
    shelterId: text('shelter_id').notNull().references(() => shelters.id, { onDelete: 'cascade' }),
    name: text('name').notNull(),
    category: text('category').notNull(),
    quantity: real('quantity').notNull().default(0),
    unitOfMeasure: text('unit_of_measure').notNull(),
    purchaseDate: text('purchase_date'),
    expirationDate: text('expiration_date'),
    description: text('description'),
    createdAt: text('created_at').notNull(),
    updatedAt: text('updated_at').notNull(),
    deletedAt: text('deleted_at'),
  },
  (table) => ({
    shelterIdx: index('inventory_items_shelter_id_idx').on(table.shelterId),
    categoryIdx: index('inventory_items_category_idx').on(table.category),
    expirationIdx: index('inventory_items_expiration_idx').on(table.expirationDate),
  })
);

// 14. Inventory Alert Rules
export const inventoryAlertRules = sqliteTable(
  'inventory_alert_rules',
  {
    id: text('id').primaryKey(),
    shelterId: text('shelter_id').notNull().references(() => shelters.id, { onDelete: 'cascade' }),
    inventoryItemId: text('inventory_item_id').notNull().references(() => inventoryItems.id, { onDelete: 'cascade' }),
    triggerType: text('trigger_type').notNull(),
    thresholdValue: real('threshold_value'),
    daysBeforeExpiration: integer('days_before_expiration'),
    isActive: integer('is_active', { mode: 'boolean' }).notNull().default(true),
    createdAt: text('created_at').notNull(),
    updatedAt: text('updated_at').notNull(),
  },
  (table) => ({
    shelterIdx: index('inventory_alerts_shelter_id_idx').on(table.shelterId),
    itemIdx: index('inventory_alerts_item_id_idx').on(table.inventoryItemId),
  })
);

// 15. Inventory Usage Templates
export const inventoryUsageTemplates = sqliteTable('inventory_usage_templates', {
  id: text('id').primaryKey(),
  shelterId: text('shelter_id').notNull().references(() => shelters.id, { onDelete: 'cascade' }),
  name: text('name').notNull(),
  description: text('description'),
  createdAt: text('created_at').notNull(),
  updatedAt: text('updated_at').notNull(),
});

// 16. Inventory Usage Template Items
export const inventoryUsageTemplateItems = sqliteTable('inventory_usage_template_items', {
  id: text('id').primaryKey(),
  templateId: text('template_id').notNull().references(() => inventoryUsageTemplates.id, { onDelete: 'cascade' }),
  inventoryItemId: text('inventory_item_id').notNull().references(() => inventoryItems.id, { onDelete: 'cascade' }),
  quantityToDecrement: real('quantity_to_decrement').notNull(),
  createdAt: text('created_at').notNull(),
});

// 17. Maintenance Tasks
export const maintenanceTasks = sqliteTable(
  'maintenance_tasks',
  {
    id: text('id').primaryKey(),
    shelterId: text('shelter_id').notNull().references(() => shelters.id, { onDelete: 'cascade' }),
    taskType: text('task_type').notNull(),
    description: text('description').notNull(),
    scheduledDate: text('scheduled_date').notNull(),
    recurrenceIntervalUnit: text('recurrence_interval_unit').notNull().default('NONE'),
    recurrenceIntervalValue: integer('recurrence_interval_value').notNull().default(0),
    assignedToName: text('assigned_to_name'),
    status: text('status').notNull().default('SCHEDULED'),
    completedAt: text('completed_at'),
    completedByOperatorName: text('completed_by_operator_name'),
    completionNotes: text('completion_notes'),
    createdAt: text('created_at').notNull(),
    updatedAt: text('updated_at').notNull(),
    deletedAt: text('deleted_at'),
  },
  (table) => ({
    shelterIdx: index('maintenance_tasks_shelter_id_idx').on(table.shelterId),
    statusIdx: index('maintenance_tasks_status_idx').on(table.status),
    scheduledDateIdx: index('maintenance_tasks_scheduled_date_idx').on(table.scheduledDate),
  })
);

// 18. Notifications
export const notifications = sqliteTable(
  'notifications',
  {
    id: text('id').primaryKey(),
    shelterId: text('shelter_id').notNull().references(() => shelters.id, { onDelete: 'cascade' }),
    tier: text('tier').notNull().default('STANDARD'),
    channel: text('channel').notNull().default('IN_APP'),
    recipientIdentifier: text('recipient_identifier').notNull(),
    title: text('title').notNull(),
    message: text('message').notNull(),
    entityType: text('entity_type'),
    entityId: text('entity_id'),
    status: text('status').notNull().default('PENDING'),
    retryCount: integer('retry_count').notNull().default(0),
    maxRetries: integer('max_retries').notNull().default(3),
    lastAttemptedAt: text('last_attempted_at'),
    deliveredAt: text('delivered_at'),
    createdAt: text('created_at').notNull(),
  },
  (table) => ({
    shelterIdx: index('notifications_shelter_id_idx').on(table.shelterId),
    statusIdx: index('notifications_status_idx').on(table.status),
  })
);

// 19. Notification Escalation Logs
export const notificationEscalationLogs = sqliteTable('notification_escalation_logs', {
  id: text('id').primaryKey(),
  notificationId: text('notification_id').notNull().references(() => notifications.id, { onDelete: 'cascade' }),
  shelterId: text('shelter_id').notNull().references(() => shelters.id, { onDelete: 'cascade' }),
  failureReason: text('failure_reason').notNull(),
  isDismissed: integer('is_dismissed', { mode: 'boolean' }).notNull().default(false),
  createdAt: text('created_at').notNull(),
  dismissedAt: text('dismissed_at'),
});
