/**
 * @luna/contracts — Repository ports and service interfaces.
 *
 * All interfaces are pure TypeScript — zero dependencies on other @luna packages.
 * Implementations live in @luna/adapter-sqlite; orchestration lives in @luna/app-core.
 */

// ─── Types ───────────────────────────────────────────────────────────────────

export type ShelterId = string;
export type EntityId = string;

export interface OperatorProfile {
  id: string;
  name: string;
  email: string;
  createdAt: string;
  updatedAt: string;
}

export interface Shelter {
  id: string;
  shelterId: string;
  name: string;
  description?: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export type Species = 'Dog' | 'Cat' | 'Bird' | 'Rabbit' | 'Other';
export type Sex = 'Male' | 'Female' | 'Unknown';
export type HealthStatus = 'Healthy' | 'InTreatment' | 'Recovering';
export type IntakeOrigin =
  | 'StreetRescue'
  | 'OwnerSurrender'
  | 'TransferFromAnotherShelter'
  | 'BornAtShelter'
  | 'Other';

export interface Pet {
  id: string;
  shelterId: string;
  name: string;
  dateOfBirth?: string;
  estimatedDOB: boolean;
  species: Species;
  breed?: string;
  sex?: Sex;
  color?: string;
  intakeOrigin: IntakeOrigin;
  intakeOriginOther?: string;
  healthConditions: string[];
  healthStatus: HealthStatus;
  status: 'active' | 'in_foster' | 'archived';
  outcome?: 'adopted' | 'deceased' | 'transferred_external';
  availableForAdoption: boolean;
  createdAt: string;
  updatedAt: string;
}

export type MediaType = 'photo' | 'video';
export type MimeType = 'image/jpeg' | 'image/png' | 'image/gif' | 'video/mp4' | 'video/quicktime';

export interface MediaAsset {
  id: string;
  entityId: string;
  entityType: 'pet' | 'appointment';
  fileName: string;
  filePath: string;
  mimeType: MimeType;
  fileSizeBytes: number;
  uploadedAt: string;
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

export type CareModality = 'Vaccine' | 'Vermifuge' | 'Medication' | 'PhysicalTherapy' | 'Grooming';
export type RecurrenceUnit = 'hours' | 'days' | 'months' | 'years';
export type CareEventStatus = 'Pending' | 'Due' | 'Overdue' | 'Completed' | 'Cancelled';
export type CareOccurrenceStatus = 'Pending' | 'Completed' | 'Cancelled';

export interface RecurrenceRule {
  interval: number;
  unit: RecurrenceUnit;
}

export interface CareEvent {
  id: string;
  shelterId: string;
  petId: string;
  modality: CareModality;
  substance?: string;
  instructions?: string;
  recurrenceRule?: RecurrenceRule;
  temporaryEndDate?: string;
  appointmentId?: string;
  status: CareEventStatus;
  completedAt?: string;
  createdAt: string;
  updatedAt: string;
}

export interface CareOccurrence {
  id: string;
  careEventId: string;
  scheduledDate: string;
  actualDate?: string;
  status: CareOccurrenceStatus;
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

export interface VeterinaryClinic {
  id: string;
  shelterId: string;
  name: string;
  address?: string;
  phone?: string;
  email?: string;
  isDeleted: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface Veterinarian {
  id: string;
  shelterId: string;
  clinicId: string;
  name: string;
  specialization?: string;
  phone?: string;
  email?: string;
  isDeleted: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface VetAppointment {
  id: string;
  shelterId: string;
  petId: string;
  clinicId: string;
  veterinarianId?: string;
  scheduledAt: string;
  isRetroactive: boolean;
  notes?: string;
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

// ─── Repository Ports ────────────────────────────────────────────────────────

export interface IOperatorRepository {
  get(): Promise<OperatorProfile | null>;
  create(data: { name: string; email: string }): Promise<OperatorProfile>;
  update(id: string, data: Partial<Pick<OperatorProfile, 'name' | 'email'>>): Promise<OperatorProfile>;
}

export interface IShelterRepository {
  list(shelterId: ShelterId): Promise<Shelter[]>;
  getById(id: string): Promise<Shelter | null>;
  create(data: { name: string; description?: string }): Promise<Shelter>;
  update(id: string, data: Partial<Pick<Shelter, 'name' | 'description'>>): Promise<Shelter>;
}

export interface IPetRepository {
  list(shelterId: ShelterId, options?: {
    search?: string;
    species?: Species;
    outcomeStatus?: Pet['outcome'];
    availableForAdoption?: boolean;
    includeArchived?: boolean;
  }): Promise<Pet[]>;
  getById(id: string, shelterId: ShelterId): Promise<Pet | null>;
  create(shelterId: ShelterId, data: Omit<Pet, 'id' | 'shelterId' | 'createdAt' | 'updatedAt'>): Promise<Pet>;
  update(id: string, shelterId: ShelterId, data: Partial<Omit<Pet, 'id' | 'shelterId' | 'createdAt' | 'updatedAt'>>): Promise<Pet>;
  hardDelete(id: string, shelterId: ShelterId): Promise<void>;
}

export interface IVetDirectoryRepository {
  listClinics(shelterId: ShelterId, options?: { search?: string }): Promise<VeterinaryClinic[]>;
  getClinic(id: string, shelterId: ShelterId): Promise<VeterinaryClinic | null>;
  createClinic(shelterId: ShelterId, data: { name: string; address?: string; phone?: string; email?: string }): Promise<VeterinaryClinic>;
  updateClinic(id: string, shelterId: ShelterId, data: Partial<Pick<VeterinaryClinic, 'name' | 'address' | 'phone' | 'email'>>): Promise<VeterinaryClinic>;
  softDeleteClinic(id: string, shelterId: ShelterId): Promise<VeterinaryClinic>;
  hardDeleteClinic(id: string, shelterId: ShelterId): Promise<void>;

  listVets(shelterId: ShelterId, options?: { clinicId?: string; search?: string }): Promise<Veterinarian[]>;
  getVet(id: string, shelterId: ShelterId): Promise<Veterinarian | null>;
  createVet(shelterId: ShelterId, data: { clinicId: string; name: string; specialization?: string; phone?: string; email?: string }): Promise<Veterinarian>;
  updateVet(id: string, shelterId: ShelterId, data: Partial<Pick<Veterinarian, 'name' | 'specialization' | 'phone' | 'email'>>): Promise<Veterinarian>;
  softDeleteVet(id: string, shelterId: ShelterId): Promise<Veterinarian>;
  hardDeleteVet(id: string, shelterId: ShelterId): Promise<void>;
}

export interface IAppointmentRepository {
  list(petId: string, shelterId: ShelterId): Promise<VetAppointment[]>;
  getById(id: string, shelterId: ShelterId): Promise<VetAppointment | null>;
  create(shelterId: ShelterId, data: Omit<VetAppointment, 'id' | 'shelterId' | 'isRetroactive' | 'createdAt' | 'updatedAt'>): Promise<VetAppointment>;
  update(id: string, shelterId: ShelterId, data: Partial<Omit<VetAppointment, 'id' | 'shelterId' | 'createdAt' | 'updatedAt'>>): Promise<VetAppointment>;
}

export interface IVetDocumentRepository {
  list(appointmentId: string, shelterId: ShelterId): Promise<VetDocument[]>;
  create(shelterId: ShelterId, data: Omit<VetDocument, 'id' | 'shelterId' | 'createdAt'>): Promise<VetDocument>;
  delete(id: string, shelterId: ShelterId): Promise<void>;
}

export interface ICareEventRepository {
  list(petId: string, shelterId: ShelterId): Promise<CareEvent[]>;
  getById(id: string, shelterId: ShelterId): Promise<CareEvent | null>;
  create(shelterId: ShelterId, data: Omit<CareEvent, 'id' | 'shelterId' | 'status' | 'createdAt' | 'updatedAt'>): Promise<CareEvent>;
  update(id: string, shelterId: ShelterId, data: Partial<Omit<CareEvent, 'id' | 'shelterId' | 'createdAt' | 'updatedAt'>>): Promise<CareEvent>;
  cancel(id: string, shelterId: ShelterId): Promise<CareEvent>;
  markCompleted(id: string, shelterId: ShelterId, actualDate: string): Promise<CareEvent>;

  listOccurrences(careEventId: string, shelterId: ShelterId): Promise<CareOccurrence[]>;
  createOccurrence(shelterId: ShelterId, data: Omit<CareOccurrence, 'id' | 'shelterId' | 'status' | 'createdAt' | 'updatedAt'>): Promise<CareOccurrence>;
  markOccurrenceCompleted(id: string, shelterId: ShelterId, actualDate: string): Promise<CareOccurrence>;
}

export interface IMediaStorageService {
  upload(entityType: 'pet' | 'appointment', entityId: string, file: {
    fileName: string;
    mimeType: MimeType;
    fileSizeBytes: number;
    buffer: Buffer;
  }): Promise<MediaAsset>;
  delete(id: string, entityType: 'pet' | 'appointment', entityId: string): Promise<void>;
  list(entityType: 'pet' | 'appointment', entityId: string): Promise<MediaAsset[]>;
}

export interface INotificationDispatcher {
  schedule(careOccurrenceId: string, shelterId: ShelterId, dueDate: string): Promise<void>;
  cancel(careOccurrenceId: string): Promise<void>;
}

// ─── Facade ──────────────────────────────────────────────────────────────────

export interface ShelterAppFacade {
  // Operator
  registerOperator(name: string, email: string): Promise<OperatorProfile>;
  getOperatorProfile(): Promise<OperatorProfile | null>;
  updateOperatorProfile(name: string, email: string): Promise<OperatorProfile>;

  // Shelters
  createShelter(name: string, description?: string): Promise<Shelter>;
  listShelters(): Promise<Shelter[]>;
  getShelter(id: string): Promise<Shelter | null>;
  updateShelter(id: string, name: string, description?: string): Promise<Shelter>;

  // Pets
  registerPet(shelterId: string, data: Omit<Pet, 'id' | 'shelterId' | 'createdAt' | 'updatedAt'>): Promise<Pet>;
  getPet(id: string, shelterId: string): Promise<Pet | null>;
  listPets(shelterId: string, options?: { search?: string; species?: Species; outcomeStatus?: Pet['outcome']; availableForAdoption?: boolean }): Promise<Pet[]>;
  updatePet(id: string, shelterId: string, data: Partial<Omit<Pet, 'id' | 'shelterId' | 'createdAt' | 'updatedAt'>>): Promise<Pet>;
  hardDeletePet(id: string, shelterId: string): Promise<void>;

  // Pet lifecycle
  transitionPetOutcome(
    petId: string,
    shelterId: string,
    outcome: Pet['outcome'],
    adopterDetails?: { name: string; phone: string; address: string }
  ): Promise<Pet>;
  placeInFoster?(petId: string, shelterId: string): Promise<Pet>;
  returnFromFoster?(petId: string, shelterId: string): Promise<Pet>;

  // Media
  uploadPetMedia(shelterId: string, petId: string, file: { fileName: string; mimeType: MimeType; fileSizeBytes: number; buffer: Buffer }): Promise<MediaAsset>;
  deletePetMedia(mediaId: string, shelterId: string, petId: string): Promise<void>;

  // Vet directory
  createClinic(shelterId: string, data: { name: string; address?: string; phone?: string; email?: string }): Promise<VeterinaryClinic>;
  updateClinic?(shelterId: string, clinicId: string, data: Partial<{ name: string; address?: string; phone?: string; email?: string }>): Promise<VeterinaryClinic>;
  getClinic?(shelterId: string, clinicId: string): Promise<VeterinaryClinic | null>;
  listClinics(shelterId: string, search?: string): Promise<VeterinaryClinic[]>;
  deleteClinic?(shelterId: string, clinicId: string): Promise<boolean>;

  createVet(shelterId: string, data: { clinicId: string; name: string; specialization?: string; phone?: string; email?: string }): Promise<Veterinarian>;
  updateVet?(shelterId: string, vetId: string, data: Partial<{ name: string; specialization?: string; phone?: string; email?: string }>): Promise<Veterinarian>;
  getVet?(shelterId: string, vetId: string): Promise<Veterinarian | null>;
  listVets(shelterId: string, clinicId?: string): Promise<Veterinarian[]>;
  deleteVet?(shelterId: string, vetId: string): Promise<boolean>;

  // Appointments
  createAppointment(shelterId: string, data: Omit<VetAppointment, 'id' | 'shelterId' | 'isRetroactive' | 'createdAt' | 'updatedAt'>): Promise<VetAppointment>;
  updateAppointment?(shelterId: string, appointmentId: string, data: Partial<Omit<VetAppointment, 'id' | 'shelterId' | 'createdAt' | 'updatedAt'>>): Promise<VetAppointment>;
  getAppointment?(shelterId: string, appointmentId: string): Promise<VetAppointment | null>;
  listAppointments(petId: string, shelterId: string): Promise<VetAppointment[]>;
  deleteAppointment?(shelterId: string, appointmentId: string): Promise<boolean>;

  // Medical documents
  uploadAppointmentDocument?(shelterId: string, appointmentId: string, file: { fileName: string; mimeType: string; fileSizeBytes: number; buffer: Buffer }): Promise<VetDocument>;
  listAppointmentDocuments?(shelterId: string, appointmentId: string): Promise<VetDocument[]>;
  deleteAppointmentDocument?(shelterId: string, appointmentId: string, documentId: string): Promise<boolean>;

  // Care events
  createCareEvent(shelterId: string, data: Omit<CareEvent, 'id' | 'shelterId' | 'status' | 'createdAt' | 'updatedAt'>): Promise<CareEvent>;
  listCareEvents(petId: string, shelterId: string): Promise<CareEvent[]>;

  // Dashboard
  getDashboardOverview(shelterId: string): Promise<{
    totalActivePets: number;
    petsInTreatment: number;
    petsInFoster: number;
    dueCareEvents: number;
    overdueCareEvents: number;
  }>;
}
