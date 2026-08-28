import {
  OperatorProfileModel,
  ShelterModel,
  PetModel,
  CareEventModel,
  CareEventOccurrenceModel,
  VetClinicModel,
  VeterinarianModel,
  VetAppointmentModel,
  AuditLogModel,
  Species,
} from '@core/domain';

export interface IShelterSession {
  readonly activeShelterId: string;
  readonly operatorId: string;
}

export interface IOperatorRepository {
  getProfile(): Promise<OperatorProfileModel | null>;
  createProfile(data: Omit<OperatorProfileModel, 'createdAt' | 'updatedAt'>): Promise<OperatorProfileModel>;
  updateLastActiveShelter(shelterId: string): Promise<void>;
}

export interface IShelterRepository {
  getById(id: string): Promise<ShelterModel | null>;
  listAll(): Promise<ShelterModel[]>;
  create(data: Omit<ShelterModel, 'id' | 'createdAt' | 'updatedAt'>): Promise<ShelterModel>;
  update(id: string, data: Partial<Omit<ShelterModel, 'id' | 'createdAt'>>): Promise<ShelterModel>;
}

export interface IPetRepository {
  getById(id: string): Promise<PetModel | null>;
  listActive(filters?: { species?: Species; isAvailableForAdoption?: boolean }): Promise<PetModel[]>;
  create(data: Omit<PetModel, 'id' | 'shelterId' | 'createdAt' | 'updatedAt' | 'deletedAt'>): Promise<PetModel>;
  update(id: string, data: Partial<Omit<PetModel, 'id' | 'shelterId' | 'createdAt'>>): Promise<PetModel>;
  softDelete(id: string): Promise<void>;
}

export interface ICareEventRepository {
  getById(id: string): Promise<CareEventModel | null>;
  listByPet(petId: string): Promise<CareEventModel[]>;
  create(data: Omit<CareEventModel, 'id' | 'shelterId' | 'createdAt' | 'updatedAt'>): Promise<CareEventModel>;
  listOccurrencesDue(startDate: string, endDate: string): Promise<CareEventOccurrenceModel[]>;
}

export interface IVetDirectoryRepository {
  listClinics(): Promise<VetClinicModel[]>;
  listVetsByClinic(clinicId: string): Promise<VeterinarianModel[]>;
  createClinic(data: Omit<VetClinicModel, 'id' | 'shelterId' | 'createdAt' | 'updatedAt' | 'deletedAt'>): Promise<VetClinicModel>;
  createAppointment(data: Omit<VetAppointmentModel, 'id' | 'shelterId' | 'createdAt' | 'updatedAt' | 'deletedAt'>): Promise<VetAppointmentModel>;
}

export interface IAuditLogRepository {
  log(entry: Omit<AuditLogModel, 'id' | 'createdAt'>): Promise<void>;
  listByEntity(entityType: string, entityId: string): Promise<AuditLogModel[]>;
}
