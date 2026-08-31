import type { IRepositoryFactory } from "../../../core/contracts/repositories.js";
import type { LunaDatabase } from "../database.js";
import { SqliteOperatorRepository } from "./operator-repository.js";
import { SqliteShelterRepository } from "./shelter-repository.js";
import { SqlitePetRepository } from "./pet-repository.js";
import { SqliteVetDirectoryRepository } from "./vet-directory-repository.js";
import { SqliteAppointmentRepository } from "./appointment-repository.js";
import { SqliteCareEventRepository } from "./care-event-repository.js";
import { SqliteAuditLogRepository } from "./audit-log-repository.js";
import type {
  Pet,
  PetMedia,
  AdopterDetails,
  VetClinic,
  Veterinarian,
  VetAppointment,
  VetDocument,
  CareEvent,
  CareEventOccurrence,
  CareOccurrenceStatus,
  AuditLog,
} from "../../../core/domain/models.js";
import type { PetSearchFilter } from "../../../core/contracts/pet-repository.js";

export {
  SqliteOperatorRepository,
  SqliteShelterRepository,
  SqlitePetRepository,
  SqliteVetDirectoryRepository,
  SqliteAppointmentRepository,
  SqliteCareEventRepository,
  SqliteAuditLogRepository,
};

export class SqliteRepositoryFactory implements IRepositoryFactory {
  readonly operatorRepo: SqliteOperatorRepository;
  readonly shelterRepo: SqliteShelterRepository;
  readonly petRepo: SqlitePetRepository;
  readonly vetDirectoryRepo: SqliteVetDirectoryRepository;
  readonly appointmentRepo: SqliteAppointmentRepository;
  readonly careEventRepo: SqliteCareEventRepository;
  readonly auditLogRepo: SqliteAuditLogRepository;

  constructor(private readonly db: LunaDatabase) {
    this.operatorRepo = new SqliteOperatorRepository(this.db);
    this.shelterRepo = new SqliteShelterRepository(this.db);
    this.petRepo = new SqlitePetRepository(this.db);
    this.vetDirectoryRepo = new SqliteVetDirectoryRepository(this.db);
    this.appointmentRepo = new SqliteAppointmentRepository(this.db);
    this.careEventRepo = new SqliteCareEventRepository(this.db);
    this.auditLogRepo = new SqliteAuditLogRepository(this.db);
  }

  forShelter(shelterId: string): ScopedRepositoryFactory {
    return new ScopedRepositoryFactory(this.db, shelterId);
  }
}

export class ScopedRepositoryFactory {
  private readonly rawPetRepo: SqlitePetRepository;
  private readonly rawVetRepo: SqliteVetDirectoryRepository;
  private readonly rawApptRepo: SqliteAppointmentRepository;
  private readonly rawCareRepo: SqliteCareEventRepository;
  private readonly rawAuditRepo: SqliteAuditLogRepository;

  constructor(
    private readonly db: LunaDatabase,
    readonly shelterId: string
  ) {
    this.rawPetRepo = new SqlitePetRepository(this.db);
    this.rawVetRepo = new SqliteVetDirectoryRepository(this.db);
    this.rawApptRepo = new SqliteAppointmentRepository(this.db);
    this.rawCareRepo = new SqliteCareEventRepository(this.db);
    this.rawAuditRepo = new SqliteAuditLogRepository(this.db);
  }

  get petRepo() {
    const sid = this.shelterId;
    const r = this.rawPetRepo;
    return {
      create: (pet: Omit<Pet, "createdAt" | "updatedAt" | "shelterId"> & { id: string }) =>
        r.create({ ...pet, shelterId: sid }),
      update: (pet: Partial<Omit<Pet, "createdAt" | "updatedAt">> & { id: string }) =>
        r.update({ ...pet, shelterId: sid }),
      findById: (id: string) => r.findById(id, sid),
      search: (filter?: PetSearchFilter) => r.search(sid, filter),
      delete: (id: string) => r.delete(id, sid),
      addMedia: (media: Omit<PetMedia, "createdAt" | "shelterId">) =>
        r.addMedia({ ...media, shelterId: sid }),
      getMedia: (petId: string) => r.getMedia(petId, sid),
      deleteMedia: (mediaId: string, petId: string) =>
        r.deleteMedia(mediaId, petId, sid),
      saveAdopterDetails: (details: Omit<AdopterDetails, "createdAt" | "updatedAt" | "shelterId">) =>
        r.saveAdopterDetails({ ...details, shelterId: sid }),
      getAdopterDetails: (petId: string) => r.getAdopterDetails(petId, sid),
    };
  }

  get vetDirectoryRepo() {
    const sid = this.shelterId;
    const r = this.rawVetRepo;
    return {
      createClinic: (clinic: Omit<VetClinic, "createdAt" | "updatedAt" | "isDeleted" | "deletedAt" | "shelterId"> & { id: string }) =>
        r.createClinic({ ...clinic, shelterId: sid }),
      updateClinic: (clinic: Partial<Omit<VetClinic, "createdAt" | "updatedAt">> & { id: string }) =>
        r.updateClinic({ ...clinic, shelterId: sid }),
      findClinicById: (id: string) => r.findClinicById(id, sid),
      listClinics: (includeDeleted?: boolean) => r.listClinics(sid, includeDeleted),
      searchClinics: (query: string) => r.searchClinics(sid, query),
      softDeleteClinic: (id: string) => r.softDeleteClinic(id, sid),
      createVeterinarian: (vet: Omit<Veterinarian, "createdAt" | "updatedAt" | "isDeleted" | "deletedAt" | "shelterId"> & { id: string }) =>
        r.createVeterinarian({ ...vet, shelterId: sid }),
      updateVeterinarian: (vet: Partial<Omit<Veterinarian, "createdAt" | "updatedAt">> & { id: string }) =>
        r.updateVeterinarian({ ...vet, shelterId: sid }),
      findVeterinarianById: (id: string) => r.findVeterinarianById(id, sid),
      listVeterinariansByClinic: (clinicId: string, includeDeleted?: boolean) =>
        r.listVeterinariansByClinic(clinicId, sid, includeDeleted),
      softDeleteVeterinarian: (id: string) => r.softDeleteVeterinarian(id, sid),
    };
  }

  get appointmentRepo() {
    const sid = this.shelterId;
    const r = this.rawApptRepo;
    return {
      create: (appt: Omit<VetAppointment, "createdAt" | "updatedAt" | "isDeleted" | "deletedAt" | "shelterId"> & { id: string }) =>
        r.create({ ...appt, shelterId: sid }),
      update: (appt: Partial<Omit<VetAppointment, "createdAt" | "updatedAt">> & { id: string }) =>
        r.update({ ...appt, shelterId: sid }),
      findById: (id: string) => r.findById(id, sid),
      listByPet: (petId: string) => r.listByPet(petId, sid),
      softDelete: (id: string) => r.softDelete(id, sid),
      addDocument: (doc: Omit<VetDocument, "createdAt" | "shelterId"> & { id: string }) =>
        r.addDocument({ ...doc, shelterId: sid }),
      getDocuments: (appointmentId: string) => r.getDocuments(appointmentId, sid),
      deleteDocument: (docId: string, appointmentId: string) =>
        r.deleteDocument(docId, appointmentId, sid),
    };
  }

  get careEventRepo() {
    const sid = this.shelterId;
    const r = this.rawCareRepo;
    return {
      create: (event: Omit<CareEvent, "createdAt" | "updatedAt" | "shelterId"> & { id: string }) =>
        r.create({ ...event, shelterId: sid }),
      update: (event: Partial<Omit<CareEvent, "createdAt" | "updatedAt">> & { id: string }) =>
        r.update({ ...event, shelterId: sid }),
      findById: (id: string) => r.findById(id, sid),
      listByPet: (petId: string) => r.listByPet(petId, sid),
      delete: (id: string) => r.delete(id, sid),
      createOccurrences: (occurrences: Omit<CareEventOccurrence, "createdAt" | "updatedAt" | "shelterId">[]) =>
        r.createOccurrences(occurrences.map((o) => ({ ...o, shelterId: sid }))),
      listOccurrencesByPet: (petId: string) => r.listOccurrencesByPet(petId, sid),
      listDueOccurrences: (beforeDate: string) => r.listDueOccurrences(sid, beforeDate),
      updateOccurrenceStatus: (
        id: string,
        status: CareOccurrenceStatus,
        completedAt?: string,
        notes?: string
      ) => r.updateOccurrenceStatus(id, sid, status, completedAt, notes),
      cancelFutureOccurrences: (careEventId: string) =>
        r.cancelFutureOccurrences(careEventId, sid),
      cancelAllPetOccurrences: (petId: string) =>
        r.cancelAllPetOccurrences(petId, sid),
    };
  }

  get auditLogRepo() {
    const sid = this.shelterId;
    const r = this.rawAuditRepo;
    return {
      append: (log: Omit<AuditLog, "id" | "createdAt" | "shelterId">) =>
        r.append({ ...log, shelterId: sid }),
      list: (limit?: number) => r.listByShelter(sid, limit),
      listByEntity: (entityType: string, entityId: string) =>
        r.listByEntity(entityType, entityId),
    };
  }
}
