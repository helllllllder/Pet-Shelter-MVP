import {
  Species,
  Sex,
  HealthStatus,
  IntakeOrigin,
  PetOutcomeStatus,
  CareModality,
  RecurrenceUnit,
  CareOccurrenceStatus,
  InventoryCategory,
  UnitOfMeasure,
  InventoryAlertTriggerType,
  MaintenanceTaskType,
  MaintenanceStatus,
  NotificationChannel,
  NotificationDeliveryStatus,
  NotificationTier,
} from './enums';

export interface OperatorProfileModel {
  id: string; // UUIDv7
  fullName: string;
  email: string;
  phone: string | null;
  lastActiveShelterId: string | null;
  deviceInstallId: string;
  createdAt: string; // ISO-8601 UTC
  updatedAt: string; // ISO-8601 UTC
}

export interface ShelterModel {
  id: string; // UUIDv7
  name: string;
  description: string | null;
  address: string | null;
  phone: string | null;
  email: string | null;
  isActive: boolean;
  createdAt: string; // ISO-8601 UTC
  updatedAt: string; // ISO-8601 UTC
}

export interface PetMediaReference {
  id: string;
  localUri: string;
  mimeType: string;
  fileSizeBytes: number;
  isPrimary: boolean;
  uploadedAt: string;
}

export interface PetModel {
  id: string; // UUIDv7
  shelterId: string; // UUIDv7
  name: string;
  species: Species;
  breed: string;
  sex: Sex;
  color: string;
  dateOfBirth: string; // YYYY-MM-DD
  isDobEstimated: boolean;
  intakeOrigin: IntakeOrigin;
  intakeOriginDetails: string | null;
  healthStatus: HealthStatus;
  healthConditions: string[]; // JSON array
  isAvailableForAdoption: boolean;
  outcomeStatus: PetOutcomeStatus;
  outcomeDate: string | null;
  outcomeNotes: string | null;
  mediaReferences: PetMediaReference[]; // JSON array
  createdAt: string;
  updatedAt: string;
  deletedAt: string | null;
}

export interface AdopterDetailModel {
  id: string;
  shelterId: string;
  petId: string;
  adopterName: string;
  adopterPhone: string;
  adopterAddress: string;
  adoptedAt: string;
  notes: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface VetClinicModel {
  id: string;
  shelterId: string;
  name: string;
  phone: string | null;
  email: string | null;
  address: string | null;
  emergencyServices: boolean;
  notes: string | null;
  createdAt: string;
  updatedAt: string;
  deletedAt: string | null;
}

export interface VeterinarianModel {
  id: string;
  shelterId: string;
  clinicId: string;
  fullName: string;
  licenseNumber: string | null;
  phone: string | null;
  email: string | null;
  specialization: string | null;
  createdAt: string;
  updatedAt: string;
  deletedAt: string | null;
}

export interface VetAppointmentModel {
  id: string;
  shelterId: string;
  petId: string;
  clinicId: string;
  veterinarianId: string | null;
  appointmentDate: string; // ISO-8601 UTC
  reason: string;
  diagnosis: string | null;
  prognosis: string | null;
  isRetroactive: boolean;
  createdAt: string;
  updatedAt: string;
  deletedAt: string | null;
}

export interface VetDocumentModel {
  id: string;
  shelterId: string;
  appointmentId: string;
  fileName: string;
  fileType: string;
  fileSizeBytes: number;
  localRelativePath: string;
  sha256Checksum: string;
  uploadedAt: string;
}

export interface CareEventModel {
  id: string;
  shelterId: string;
  petId: string;
  linkedAppointmentId: string | null;
  modality: CareModality;
  substanceName: string | null;
  dosage: string | null;
  administrationInstructions: string | null;
  recurrenceIntervalUnit: RecurrenceUnit;
  recurrenceIntervalValue: number;
  startDate: string; // YYYY-MM-DD
  endDate: string | null; // YYYY-MM-DD
  status: 'ACTIVE' | 'CANCELLED';
  createdAt: string;
  updatedAt: string;
}

export interface CareEventOccurrenceModel {
  id: string;
  shelterId: string;
  careEventId: string;
  petId: string;
  dueDate: string; // ISO-8601 UTC
  status: CareOccurrenceStatus;
  administeredAt: string | null;
  administeredByOperatorName: string | null;
  notes: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface AuditLogModel {
  id: string;
  shelterId: string | null;
  entityType: string;
  entityId: string;
  action: string;
  actorName: string;
  actorContact: string | null;
  payloadDiffJson: string | null;
  ipOrDeviceId: string;
  createdAt: string;
}

// Phase 2 Models
export interface InventoryItemModel {
  id: string;
  shelterId: string;
  name: string;
  category: InventoryCategory;
  quantity: number;
  unitOfMeasure: UnitOfMeasure;
  purchaseDate: string | null;
  expirationDate: string | null;
  description: string | null;
  createdAt: string;
  updatedAt: string;
  deletedAt: string | null;
}

export interface InventoryAlertRuleModel {
  id: string;
  shelterId: string;
  inventoryItemId: string;
  triggerType: InventoryAlertTriggerType;
  thresholdValue: number | null;
  daysBeforeExpiration: number | null;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface InventoryUsageTemplateModel {
  id: string;
  shelterId: string;
  name: string;
  description: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface InventoryUsageTemplateItemModel {
  id: string;
  templateId: string;
  inventoryItemId: string;
  quantityToDecrement: number;
  createdAt: string;
}

export interface MaintenanceTaskModel {
  id: string;
  shelterId: string;
  taskType: MaintenanceTaskType;
  description: string;
  scheduledDate: string; // ISO-8601 UTC
  recurrenceIntervalUnit: RecurrenceUnit;
  recurrenceIntervalValue: number;
  assignedToName: string | null;
  status: MaintenanceStatus;
  completedAt: string | null;
  completedByOperatorName: string | null;
  completionNotes: string | null;
  createdAt: string;
  updatedAt: string;
  deletedAt: string | null;
}

export interface NotificationModel {
  id: string;
  shelterId: string;
  tier: NotificationTier;
  channel: NotificationChannel;
  recipientIdentifier: string;
  title: string;
  message: string;
  entityType: string | null;
  entityId: string | null;
  status: NotificationDeliveryStatus;
  retryCount: number;
  maxRetries: number;
  lastAttemptedAt: string | null;
  deliveredAt: string | null;
  createdAt: string;
}

export interface NotificationEscalationModel {
  id: string;
  notificationId: string;
  shelterId: string;
  failureReason: string;
  isDismissed: boolean;
  createdAt: string;
  dismissedAt: string | null;
}
