import type {
  IntakeOrigin,
  HealthStatus,
  PetOutcomeStatus,
  PetSex,
  MediaType,
  CareModality,
  RecurrenceIntervalUnit,
  CareEventStatus,
  CareOccurrenceStatus,
  AuditAction,
  AuditActorType,
} from "./enums.js";

export type {
  IntakeOrigin,
  HealthStatus,
  PetOutcomeStatus,
  PetSex,
  MediaType,
  CareModality,
  RecurrenceIntervalUnit,
  CareEventStatus,
  CareOccurrenceStatus,
  AuditAction,
  AuditActorType,
};

export interface OperatorProfile {
  id: string;
  name: string;
  email: string;
  createdAt: string;
  updatedAt: string;
}

export interface Shelter {
  id: string;
  name: string;
  description: string | null;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface Pet {
  id: string;
  shelterId: string;
  name: string;
  dob: string;
  isDobEstimated: boolean;
  species: string;
  breed: string;
  sex: PetSex;
  color: string;
  intakeOrigin: IntakeOrigin;
  intakeOriginDetail: string | null;
  healthConditions: string | null;
  healthStatus: HealthStatus;
  availableForAdoption: boolean;
  outcomeStatus: PetOutcomeStatus | null;
  outcomeDate: string | null;
  isArchived: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface PetMedia {
  id: string;
  shelterId: string;
  petId: string;
  mediaType: MediaType;
  filePath: string;
  mimeType: string;
  fileSizeBytes: number;
  createdAt: string;
}

export interface AdopterDetails {
  id: string;
  shelterId: string;
  petId: string;
  name: string;
  phone: string;
  address: string;
  createdAt: string;
  updatedAt: string;
}

export interface ShadowRecord {
  id: string;
  originShelterId: string;
  destinationShelterId: string;
  originPetId: string;
  destinationPetId: string;
  snapshotData: string;
  transferredAt: string;
}

export interface VetClinic {
  id: string;
  shelterId: string;
  name: string;
  address: string | null;
  phone: string | null;
  email: string | null;
  isDeleted: boolean;
  deletedAt: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface Veterinarian {
  id: string;
  shelterId: string;
  clinicId: string;
  name: string;
  specialization: string | null;
  phone: string | null;
  email: string | null;
  isDeleted: boolean;
  deletedAt: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface VetAppointment {
  id: string;
  shelterId: string;
  petId: string;
  clinicId: string;
  veterinarianId: string | null;
  appointmentDate: string;
  isRetroactive: boolean;
  notes: string;
  isDeleted: boolean;
  deletedAt: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface VetDocument {
  id: string;
  shelterId: string;
  appointmentId: string;
  fileName: string;
  filePath: string;
  mimeType: string;
  fileSizeBytes: number;
  createdAt: string;
}

export interface CareEvent {
  id: string;
  shelterId: string;
  petId: string;
  appointmentId: string | null;
  modality: CareModality;
  substance: string | null;
  instructions: string | null;
  isRecurring: boolean;
  recurrenceIntervalValue: number | null;
  recurrenceIntervalUnit: RecurrenceIntervalUnit | null;
  isTemporary: boolean;
  startDate: string;
  endDate: string | null;
  status: CareEventStatus;
  createdAt: string;
  updatedAt: string;
}

export interface CareEventOccurrence {
  id: string;
  shelterId: string;
  careEventId: string;
  petId: string;
  dueDate: string;
  status: CareOccurrenceStatus;
  completedAt: string | null;
  notes: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface AuditLog {
  id: string;
  shelterId: string | null;
  entityType: string;
  entityId: string;
  action: AuditAction;
  actorType: AuditActorType;
  actorId: string;
  details: string;
  createdAt: string;
}
