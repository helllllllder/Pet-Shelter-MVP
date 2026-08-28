import {
  Species,
  Sex,
  HealthStatus,
  IntakeOrigin,
  PetOutcomeStatus,
  CareModality,
  RecurrenceUnit,
  CareOccurrenceStatus,
  DocumentMimeType,
  AuditAction,
} from './enums';

export interface PetMediaReference {
  id: string; // UUIDv7
  type: 'PHOTO' | 'VIDEO';
  localUri: string;
  fileName: string;
  fileSizeBytes: number;
  uploadedAt: string;
}

export interface OperatorProfileModel {
  id: string; // UUIDv7
  fullName: string;
  email: string;
  phone: string | null;
  lastActiveShelterId: string | null;
  deviceInstallId: string;
  createdAt: string;
  updatedAt: string;
}

export interface ShelterModel {
  id: string; // UUIDv7
  name: string;
  description: string | null;
  address: string | null;
  phone: string | null;
  email: string | null;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface PetModel {
  id: string; // UUIDv7
  shelterId: string;
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
  healthConditions: string[];
  isAvailableForAdoption: boolean;
  outcomeStatus: PetOutcomeStatus;
  outcomeDate: string | null;
  outcomeNotes: string | null;
  mediaReferences: PetMediaReference[];
  createdAt: string;
  updatedAt: string;
  deletedAt: string | null;
}

export interface AdopterDetailModel {
  id: string; // UUIDv7
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

export interface ShadowRecordModel {
  id: string; // UUIDv7
  originShelterId: string;
  destinationShelterId: string;
  originPetId: string;
  destinationPetId: string;
  transferredAt: string;
  snapshotPayloadJson: string;
  createdAt: string;
}

export interface VetClinicModel {
  id: string; // UUIDv7
  shelterId: string;
  name: string;
  phone: string;
  email: string | null;
  address: string;
  emergencyServices: boolean;
  notes: string | null;
  createdAt: string;
  updatedAt: string;
  deletedAt: string | null;
}

export interface VeterinarianModel {
  id: string; // UUIDv7
  shelterId: string;
  clinicId: string;
  name: string;
  licenseNumber: string | null;
  phone: string | null;
  email: string | null;
  specialty: string | null;
  createdAt: string;
  updatedAt: string;
  deletedAt: string | null;
}

export interface VetAppointmentModel {
  id: string; // UUIDv7
  shelterId: string;
  petId: string;
  clinicId: string;
  veterinarianId: string | null;
  appointmentDate: string;
  reason: string;
  diagnosis: string | null;
  prognosis: string | null;
  isRetroactive: boolean;
  createdAt: string;
  updatedAt: string;
  deletedAt: string | null;
}

export interface VetDocumentModel {
  id: string; // UUIDv7
  shelterId: string;
  appointmentId: string;
  fileName: string;
  fileType: DocumentMimeType;
  fileSizeBytes: number;
  localRelativePath: string;
  sha256Checksum: string;
  uploadedAt: string;
  createdAt: string;
}

export interface CareEventModel {
  id: string; // UUIDv7
  shelterId: string;
  petId: string;
  linkedAppointmentId: string | null;
  modality: CareModality;
  substanceName: string | null;
  dosage: string | null;
  administrationInstructions: string | null;
  recurrenceIntervalUnit: RecurrenceUnit;
  recurrenceIntervalValue: number;
  startDate: string;
  endDate: string | null;
  status: 'ACTIVE' | 'COMPLETED' | 'CANCELLED';
  createdAt: string;
  updatedAt: string;
}

export interface CareEventOccurrenceModel {
  id: string; // UUIDv7
  shelterId: string;
  careEventId: string;
  petId: string;
  dueDate: string;
  status: CareOccurrenceStatus;
  administeredAt: string | null;
  administeredByOperatorName: string | null;
  notes: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface AuditLogModel {
  id: string; // UUIDv7
  shelterId: string | null;
  entityType: 'OPERATOR' | 'SHELTER' | 'PET' | 'APPOINTMENT' | 'CARE_EVENT' | 'EXPORT' | 'ADOPTION';
  entityId: string;
  action: AuditAction;
  actorName: string;
  actorContact: string | null;
  payloadDiffJson: string | null;
  ipOrDeviceId: string;
  createdAt: string;
}
