import type {
  ShelterAppFacade,
  OperatorProfile,
  Shelter,
  Pet,
  Species,
  MediaAsset,
  MimeType,
  VeterinaryClinic,
  Veterinarian,
  VetAppointment,
  CareEvent,
  CareEventStatus,
} from "../../contracts/src/index.js";
import { PetService } from "./pet-service.js";
import { PetLifecycleService } from "./pet-lifecycle-service.js";
import type { SqliteRepositoryFactory } from "../../adapter-sqlite/src/index.js";
import { generateUUIDv7 } from "../../domain/src/index.js";

export class ShelterAppFacadeImpl implements ShelterAppFacade {
  private readonly petService: PetService;
  private readonly lifecycleService: PetLifecycleService;

  constructor(private readonly factory: SqliteRepositoryFactory) {
    this.petService = new PetService(
      this.factory.petRepo,
      this.factory.auditLogRepo
    );
    this.lifecycleService = new PetLifecycleService(
      this.factory.petRepo,
      this.factory.careEventRepo,
      this.factory.auditLogRepo
    );
  }

  // Operator
  async registerOperator(name: string, email: string): Promise<OperatorProfile> {
    const id = generateUUIDv7();
    const profile = await this.factory.operatorRepo.saveProfile({
      id,
      name,
      email,
    });
    return this.mapOperatorProfile(profile);
  }

  async getOperatorProfile(): Promise<OperatorProfile | null> {
    const profile = await this.factory.operatorRepo.getProfile();
    if (!profile) return null;
    return this.mapOperatorProfile(profile);
  }

  async updateOperatorProfile(name: string, email: string): Promise<OperatorProfile> {
    const existing = await this.factory.operatorRepo.getProfile();
    if (!existing) {
      throw new Error("No operator profile found to update");
    }
    const profile = await this.factory.operatorRepo.updateProfile({
      id: existing.id,
      name,
      email,
    });
    return this.mapOperatorProfile(profile);
  }

  // Shelters
  async createShelter(name: string, description?: string): Promise<Shelter> {
    const id = generateUUIDv7();
    const created = await this.factory.shelterRepo.create({
      id,
      name,
      description: description || null,
      isActive: true,
    });
    return this.mapShelter(created);
  }

  async listShelters(): Promise<Shelter[]> {
    const list = await this.factory.shelterRepo.listAll();
    return list.map((s) => this.mapShelter(s));
  }

  async getShelter(id: string): Promise<Shelter | null> {
    const s = await this.factory.shelterRepo.findById(id);
    if (!s) return null;
    return this.mapShelter(s);
  }

  async updateShelter(id: string, name: string, description?: string): Promise<Shelter> {
    const updated = await this.factory.shelterRepo.update({
      id,
      name,
      description: description || null,
    });
    return this.mapShelter(updated);
  }

  // Pets
  async registerPet(
    shelterId: string,
    data: Omit<Pet, "id" | "shelterId" | "createdAt" | "updatedAt">
  ): Promise<Pet> {
    const pet = await this.petService.registerPet(shelterId, {
      name: data.name,
      dob: data.dateOfBirth || new Date().toISOString().split("T")[0],
      isDobEstimated: data.estimatedDOB ?? false,
      species: data.species,
      breed: data.breed,
      sex: data.sex,
      color: data.color,
      intakeOrigin: this.mapContractOriginToDomain(data.intakeOrigin),
      intakeOriginDetail: data.intakeOriginOther,
      healthConditions: Array.isArray(data.healthConditions)
        ? JSON.stringify(data.healthConditions)
        : data.healthConditions,
      healthStatus:
        data.healthStatus === "InTreatment" ? "In Treatment" : data.healthStatus,
      availableForAdoption: data.availableForAdoption,
    });
    return this.mapPetToContract(pet);
  }

  async getPet(id: string, shelterId: string): Promise<Pet | null> {
    const pet = await this.petService.getPet(id, shelterId);
    if (!pet) return null;
    return this.mapPetToContract(pet);
  }

  async listPets(
    shelterId: string,
    options?: {
      search?: string;
      species?: Species;
      outcomeStatus?: Pet["outcome"];
      availableForAdoption?: boolean;
    }
  ): Promise<Pet[]> {
    let list = await this.petService.listPets(shelterId, {
      query: options?.search,
      species: options?.species,
      availableForAdoption: options?.availableForAdoption,
    });

    if (options?.outcomeStatus) {
      const targetDomainStatus =
        options.outcomeStatus === "adopted"
          ? "Adopted"
          : options.outcomeStatus === "deceased"
          ? "Deceased"
          : options.outcomeStatus === "transferred_external"
          ? "Transferred (External)"
          : null;
      if (targetDomainStatus) {
        list = list.filter((p) => p.outcomeStatus === targetDomainStatus);
      }
    }

    return list.map((p) => this.mapPetToContract(p));
  }

  async updatePet(
    id: string,
    shelterId: string,
    data: Partial<Omit<Pet, "id" | "shelterId" | "createdAt" | "updatedAt">>
  ): Promise<Pet> {
    const updated = await this.petService.updatePet(id, shelterId, {
      name: data.name,
      species: data.species,
      breed: data.breed,
      sex: data.sex,
      color: data.color,
      healthStatus:
        data.healthStatus === "InTreatment" ? "In Treatment" : data.healthStatus,
      availableForAdoption: data.availableForAdoption,
    });
    return this.mapPetToContract(updated);
  }

  async hardDeletePet(id: string, shelterId: string): Promise<void> {
    await this.petService.hardDeletePet(id, shelterId);
  }

  // Pet lifecycle
  async transitionPetOutcome(
    petId: string,
    shelterId: string,
    outcome: Pet["outcome"],
    adopterDetails?: { name: string; phone: string; address: string }
  ): Promise<Pet> {
    let pet;
    if (outcome === "adopted") {
      const details = adopterDetails || {
        name: "Standard Adopter",
        phone: "555-0000",
        address: "123 Adoption Way",
      };
      const res = await this.lifecycleService.recordAdoption(petId, shelterId, details);
      pet = res.pet;
    } else if (outcome === "deceased") {
      pet = await this.lifecycleService.recordDeceased(petId, shelterId);
    } else if (outcome === "transferred_external") {
      pet = await this.lifecycleService.recordExternalTransfer(petId, shelterId);
    } else {
      throw new Error(`Unsupported outcome transition: ${outcome}`);
    }
    return this.mapPetToContract(pet);
  }

  async placeInFoster(petId: string, shelterId: string): Promise<Pet> {
    const pet = await this.lifecycleService.placeInFoster(petId, shelterId);
    return this.mapPetToContract(pet);
  }

  async returnFromFoster(petId: string, shelterId: string): Promise<Pet> {
    const pet = await this.lifecycleService.returnFromFoster(petId, shelterId);
    return this.mapPetToContract(pet);
  }

  // Media
  async uploadPetMedia(
    shelterId: string,
    petId: string,
    file: { fileName: string; mimeType: MimeType; fileSizeBytes: number; buffer: Buffer }
  ): Promise<MediaAsset> {
    const media = await this.petService.uploadMedia(shelterId, petId, {
      fileName: file.fileName,
      mimeType: file.mimeType,
      buffer: file.buffer,
    });
    return {
      id: media.id,
      entityId: petId,
      entityType: "pet",
      fileName: file.fileName,
      filePath: media.filePath,
      mimeType: file.mimeType,
      fileSizeBytes: media.fileSizeBytes,
      uploadedAt: media.createdAt,
    };
  }

  async deletePetMedia(mediaId: string, shelterId: string, petId: string): Promise<void> {
    await this.petService.deleteMedia(mediaId, petId, shelterId);
  }

  // Vet directory
  async createClinic(
    shelterId: string,
    data: { name: string; address?: string; phone?: string; email?: string }
  ): Promise<VeterinaryClinic> {
    const id = generateUUIDv7();
    const clinic = await this.factory.vetDirectoryRepo.createClinic({
      id,
      shelterId,
      name: data.name,
      address: data.address || null,
      phone: data.phone || null,
      email: data.email || null,
    });
    return this.mapClinic(clinic);
  }

  async listClinics(shelterId: string, search?: string): Promise<VeterinaryClinic[]> {
    const list = search
      ? await this.factory.vetDirectoryRepo.searchClinics(shelterId, search)
      : await this.factory.vetDirectoryRepo.listClinics(shelterId);
    return list.map((c) => this.mapClinic(c));
  }

  async createVet(
    shelterId: string,
    data: { clinicId: string; name: string; specialization?: string; phone?: string; email?: string }
  ): Promise<Veterinarian> {
    const id = generateUUIDv7();
    const vet = await this.factory.vetDirectoryRepo.createVeterinarian({
      id,
      shelterId,
      clinicId: data.clinicId,
      name: data.name,
      specialization: data.specialization || null,
      phone: data.phone || null,
      email: data.email || null,
    });
    return this.mapVet(vet);
  }

  async listVets(shelterId: string, clinicId?: string): Promise<Veterinarian[]> {
    const list = clinicId
      ? await this.factory.vetDirectoryRepo.listVeterinariansByClinic(clinicId, shelterId)
      : [];
    return list.map((v) => this.mapVet(v));
  }

  // Appointments
  async createAppointment(
    shelterId: string,
    data: Omit<VetAppointment, "id" | "shelterId" | "isRetroactive" | "createdAt" | "updatedAt">
  ): Promise<VetAppointment> {
    const id = generateUUIDv7();
    const scheduledAt = data.scheduledAt;
    const appt = await this.factory.appointmentRepo.create({
      id,
      shelterId,
      petId: data.petId,
      clinicId: data.clinicId,
      veterinarianId: data.veterinarianId || null,
      appointmentDate: scheduledAt,
      isRetroactive: new Date(scheduledAt) < new Date(),
      notes: data.notes || "",
    });
    return this.mapAppointment(appt);
  }

  async listAppointments(petId: string, shelterId: string): Promise<VetAppointment[]> {
    const list = await this.factory.appointmentRepo.listByPet(petId, shelterId);
    return list.map((a) => this.mapAppointment(a));
  }

  // Care events
  async createCareEvent(
    shelterId: string,
    data: Omit<CareEvent, "id" | "shelterId" | "status" | "createdAt" | "updatedAt">
  ): Promise<CareEvent> {
    const id = generateUUIDv7();
    const domainModality =
      data.modality === "PhysicalTherapy"
        ? "Physical Therapy"
        : data.modality;
    const event = await this.factory.careEventRepo.create({
      id,
      shelterId,
      petId: data.petId,
      appointmentId: data.appointmentId || null,
      modality: domainModality as any,
      substance: data.substance || null,
      instructions: data.instructions || null,
      isRecurring: data.recurrenceRule !== undefined,
      recurrenceIntervalValue: data.recurrenceRule?.interval || null,
      recurrenceIntervalUnit: data.recurrenceRule?.unit || null,
      isTemporary: data.temporaryEndDate !== undefined,
      startDate: new Date().toISOString(),
      endDate: data.temporaryEndDate || null,
      status: "ACTIVE",
    });
    return this.mapCareEvent(event);
  }

  async listCareEvents(petId: string, shelterId: string): Promise<CareEvent[]> {
    const list = await this.factory.careEventRepo.listByPet(petId, shelterId);
    return list.map((e) => this.mapCareEvent(e));
  }

  // Dashboard
  async getDashboardOverview(shelterId: string): Promise<{
    totalActivePets: number;
    petsInTreatment: number;
    petsInFoster: number;
    dueCareEvents: number;
    overdueCareEvents: number;
  }> {
    const pets = await this.factory.petRepo.search(shelterId);
    const activePets = pets.filter((p) => !p.isArchived);
    const inTreatment = activePets.filter(
      (p) => p.healthStatus === "In Treatment" || (p.healthStatus as string) === "InTreatment"
    ).length;
    const inFoster = activePets.filter((p) => p.outcomeStatus === "In Foster").length;

    const now = new Date();
    const dueOccurrences = await this.factory.careEventRepo.listDueOccurrences(
      shelterId,
      now.toISOString()
    );

    const overdueOccurrences = dueOccurrences.filter(
      (o) => new Date(o.dueDate).getTime() < now.getTime() - 24 * 60 * 60 * 1000
    );

    return {
      totalActivePets: activePets.length,
      petsInTreatment: inTreatment,
      petsInFoster: inFoster,
      dueCareEvents: dueOccurrences.length,
      overdueCareEvents: overdueOccurrences.length,
    };
  }

  // Mappers
  private mapOperatorProfile(profile: any): OperatorProfile {
    return {
      id: profile.id,
      name: profile.name,
      email: profile.email,
      createdAt: profile.createdAt,
      updatedAt: profile.updatedAt,
    };
  }

  private mapShelter(shelter: any): Shelter {
    return {
      id: shelter.id,
      shelterId: shelter.id,
      name: shelter.name,
      description: shelter.description || undefined,
      isActive: shelter.isActive,
      createdAt: shelter.createdAt,
      updatedAt: shelter.updatedAt,
    };
  }

  private mapClinic(clinic: any): VeterinaryClinic {
    return {
      id: clinic.id,
      shelterId: clinic.shelterId,
      name: clinic.name,
      address: clinic.address || undefined,
      phone: clinic.phone || undefined,
      email: clinic.email || undefined,
      isDeleted: clinic.isDeleted,
      createdAt: clinic.createdAt,
      updatedAt: clinic.updatedAt,
    };
  }

  private mapVet(vet: any): Veterinarian {
    return {
      id: vet.id,
      shelterId: vet.shelterId,
      clinicId: vet.clinicId,
      name: vet.name,
      specialization: vet.specialization || undefined,
      phone: vet.phone || undefined,
      email: vet.email || undefined,
      isDeleted: vet.isDeleted,
      createdAt: vet.createdAt,
      updatedAt: vet.updatedAt,
    };
  }

  private mapAppointment(appt: any): VetAppointment {
    return {
      id: appt.id,
      shelterId: appt.shelterId,
      petId: appt.petId,
      clinicId: appt.clinicId,
      veterinarianId: appt.veterinarianId || undefined,
      scheduledAt: appt.appointmentDate,
      isRetroactive: appt.isRetroactive,
      notes: appt.notes || undefined,
      createdAt: appt.createdAt,
      updatedAt: appt.updatedAt,
    };
  }

  private mapCareEvent(event: any): CareEvent {
    const modality =
      event.modality === "Physical Therapy"
        ? "PhysicalTherapy"
        : event.modality;
    return {
      id: event.id,
      shelterId: event.shelterId,
      petId: event.petId,
      appointmentId: event.appointmentId || undefined,
      modality,
      substance: event.substance || undefined,
      instructions: event.instructions || undefined,
      recurrenceRule: event.recurrenceIntervalValue
        ? {
            interval: event.recurrenceIntervalValue,
            unit: event.recurrenceIntervalUnit as any,
          }
        : undefined,
      temporaryEndDate: event.endDate || undefined,
      status: (event.status === "ACTIVE" ? "Pending" : "Cancelled") as CareEventStatus,
      createdAt: event.createdAt,
      updatedAt: event.updatedAt,
    };
  }

  private mapContractOriginToDomain(
    origin: Pet["intakeOrigin"]
  ): "STREET_RESCUE" | "OWNER_SURRENDER" | "BORN_AT_SHELTER" | "TRANSFER" | "OTHER" {
    switch (origin) {
      case "StreetRescue":
        return "STREET_RESCUE";
      case "OwnerSurrender":
        return "OWNER_SURRENDER";
      case "BornAtShelter":
        return "BORN_AT_SHELTER";
      case "TransferFromAnotherShelter":
        return "TRANSFER";
      case "Other":
      default:
        return "OTHER";
    }
  }

  private mapPetToContract(pet: any): Pet {
    const outcome: Pet["outcome"] =
      pet.outcomeStatus === "Adopted"
        ? "adopted"
        : pet.outcomeStatus === "Deceased"
        ? "deceased"
        : pet.outcomeStatus === "Transferred (External)"
        ? "transferred_external"
        : undefined;

    const status: Pet["status"] = pet.isArchived
      ? "archived"
      : pet.outcomeStatus === "In Foster"
      ? "in_foster"
      : "active";

    let intakeOrigin: Pet["intakeOrigin"] = "Other";
    if (pet.intakeOrigin === "STREET_RESCUE") intakeOrigin = "StreetRescue";
    else if (pet.intakeOrigin === "OWNER_SURRENDER") intakeOrigin = "OwnerSurrender";
    else if (pet.intakeOrigin === "BORN_AT_SHELTER") intakeOrigin = "BornAtShelter";
    else if (pet.intakeOrigin === "TRANSFER") intakeOrigin = "TransferFromAnotherShelter";

    return {
      id: pet.id,
      shelterId: pet.shelterId,
      name: pet.name,
      dateOfBirth: pet.dob,
      estimatedDOB: pet.isDobEstimated,
      species: pet.species,
      breed: pet.breed || undefined,
      sex: pet.sex || undefined,
      color: pet.color || undefined,
      intakeOrigin,
      intakeOriginOther: pet.intakeOriginDetail || undefined,
      healthConditions: pet.healthConditions
        ? typeof pet.healthConditions === "string"
          ? JSON.parse(pet.healthConditions)
          : pet.healthConditions
        : [],
      healthStatus: pet.healthStatus === "In Treatment" ? "InTreatment" : pet.healthStatus,
      status,
      outcome,
      availableForAdoption: pet.availableForAdoption,
      createdAt: pet.createdAt,
      updatedAt: pet.updatedAt,
    };
  }
}
