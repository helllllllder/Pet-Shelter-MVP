import type {
  IPetRepository,
  PetSearchFilter,
} from "../../../src/core/contracts/pet-repository.js";
import type { IAuditLogRepository } from "../../../src/core/contracts/audit-log-repository.js";
import type { IMediaStorageService } from "../../../src/core/contracts/services.js";
import type {
  Pet,
  PetMedia,
  MediaType,
  AuditAction,
} from "../../../src/core/domain/models.js";
import { generateUUIDv7 } from "../../../src/core/domain/uuid.js";

export const ALLOWED_MEDIA_MIME_TYPES = [
  "image/jpeg",
  "image/png",
  "image/gif",
  "video/mp4",
  "video/quicktime",
] as const;

export type AllowedMimeType = (typeof ALLOWED_MEDIA_MIME_TYPES)[number];

export interface RegisterPetInput {
  name: string;
  dob: string;
  isDobEstimated?: boolean;
  species: string;
  breed?: string;
  sex?: Pet["sex"];
  color?: string;
  intakeOrigin: Pet["intakeOrigin"];
  intakeOriginDetail?: string | null;
  healthConditions?: string | null;
  healthStatus: Pet["healthStatus"];
  availableForAdoption?: boolean;
}

export type UpdatePetInput = Partial<RegisterPetInput>;

export interface UploadMediaInput {
  fileName: string;
  mimeType: string;
  buffer: Buffer | Uint8Array;
}

export interface DetailedPetProfile {
  pet: Pet;
  media: PetMedia[];
}

export class PetService {
  constructor(
    private readonly petRepo: IPetRepository,
    private readonly auditLogRepo?: IAuditLogRepository,
    private readonly mediaStorage?: IMediaStorageService
  ) {}

  async registerPet(shelterId: string, input: RegisterPetInput): Promise<Pet> {
    const trimmedName = input.name?.trim();
    if (!trimmedName) {
      throw new Error("Pet name is required");
    }

    if (!input.species || input.species.trim().length === 0) {
      throw new Error("Species is required");
    }

    if (!input.intakeOrigin) {
      throw new Error("Intake origin is required");
    }

    if (
      (input.intakeOrigin === "OTHER" || (input.intakeOrigin as string) === "Other") &&
      (!input.intakeOriginDetail || input.intakeOriginDetail.trim().length === 0)
    ) {
      throw new Error("Intake origin detail is required when origin is Other");
    }

    if (!input.healthStatus) {
      throw new Error("Health status is required");
    }

    if (!input.dob || input.dob.trim().length === 0) {
      throw new Error("Date of birth is required");
    }

    const id = generateUUIDv7();
    const pet: Omit<Pet, "createdAt" | "updatedAt"> = {
      id,
      shelterId,
      name: trimmedName,
      dob: input.dob.trim(),
      isDobEstimated: input.isDobEstimated ?? false,
      species: input.species.trim(),
      breed: input.breed?.trim() || "",
      sex: input.sex || "Unknown",
      color: input.color?.trim() || "",
      intakeOrigin: input.intakeOrigin,
      intakeOriginDetail: input.intakeOriginDetail?.trim() || null,
      healthConditions: input.healthConditions || null,
      healthStatus: input.healthStatus,
      availableForAdoption: input.availableForAdoption ?? false,
      outcomeStatus: null,
      outcomeDate: null,
      isArchived: false,
    };

    const created = await this.petRepo.create(pet);
    await this.logAudit(shelterId, "CREATE", created.id, {
      name: created.name,
      species: created.species,
    });

    return created;
  }

  async getPet(id: string, shelterId: string): Promise<Pet | null> {
    return this.petRepo.findById(id, shelterId);
  }

  async getPetDetails(
    id: string,
    shelterId: string
  ): Promise<DetailedPetProfile | null> {
    const pet = await this.getPet(id, shelterId);
    if (!pet) return null;

    const media = await this.getMedia(id, shelterId);
    return { pet, media };
  }

  async listPets(shelterId: string, filter?: PetSearchFilter): Promise<Pet[]> {
    return this.petRepo.search(shelterId, filter);
  }

  async updatePet(
    id: string,
    shelterId: string,
    input: UpdatePetInput
  ): Promise<Pet> {
    const existing = await this.petRepo.findById(id, shelterId);
    if (!existing) {
      throw new Error(`Pet with ID ${id} not found in shelter ${shelterId}`);
    }

    if (input.name !== undefined && input.name.trim().length === 0) {
      throw new Error("Pet name cannot be empty");
    }

    const updated = await this.petRepo.update({
      id,
      shelterId,
      ...input,
      name: input.name !== undefined ? input.name.trim() : existing.name,
    });

    await this.logAudit(shelterId, "UPDATE", id, input);
    return updated;
  }

  async hardDeletePet(id: string, shelterId: string): Promise<boolean> {
    const existing = await this.petRepo.findById(id, shelterId);
    if (!existing) {
      throw new Error(`Pet with ID ${id} not found in shelter ${shelterId}`);
    }

    if (existing.isArchived) {
      throw new Error("Cannot delete archived pet");
    }

    // Delete attached media assets
    const mediaList = await this.petRepo.getMedia(id, shelterId);
    for (const media of mediaList) {
      await this.deleteMedia(media.id, id, shelterId);
    }

    const success = await this.petRepo.delete(id, shelterId);
    if (success) {
      await this.logAudit(shelterId, "DELETE", id, { name: existing.name });
    }

    return success;
  }

  async uploadMedia(
    shelterId: string,
    petId: string,
    file: UploadMediaInput
  ): Promise<PetMedia> {
    const pet = await this.petRepo.findById(petId, shelterId);
    if (!pet) {
      throw new Error(`Pet with ID ${petId} not found in shelter ${shelterId}`);
    }

    if (!ALLOWED_MEDIA_MIME_TYPES.includes(file.mimeType as AllowedMimeType)) {
      throw new Error(
        `Unsupported media MIME type: ${file.mimeType}. Supported types: ${ALLOWED_MEDIA_MIME_TYPES.join(", ")}`
      );
    }

    let filePath = file.fileName;
    let fileSizeBytes = file.buffer.length;

    if (this.mediaStorage) {
      const stored = await this.mediaStorage.storeFile(
        file.buffer,
        file.fileName,
        file.mimeType,
        shelterId
      );
      filePath = stored.filePath;
      fileSizeBytes = stored.fileSizeBytes;
    }

    const mediaType: MediaType = file.mimeType.startsWith("video/")
      ? "VIDEO"
      : "PHOTO";

    const media = await this.petRepo.addMedia({
      id: generateUUIDv7(),
      shelterId,
      petId,
      mediaType,
      filePath,
      mimeType: file.mimeType,
      fileSizeBytes,
    });

    await this.logAudit(shelterId, "UPDATE", petId, {
      action: "UPLOAD_MEDIA",
      mediaId: media.id,
    });

    return media;
  }

  async getMedia(petId: string, shelterId: string): Promise<PetMedia[]> {
    return this.petRepo.getMedia(petId, shelterId);
  }

  async deleteMedia(
    mediaId: string,
    petId: string,
    shelterId: string
  ): Promise<boolean> {
    const mediaList = await this.petRepo.getMedia(petId, shelterId);
    const media = mediaList.find((m) => m.id === mediaId);
    if (!media) return false;

    if (this.mediaStorage && media.filePath) {
      try {
        await this.mediaStorage.deleteFile(media.filePath);
      } catch {
        // Ignore filesystem delete error if file already removed
      }
    }

    const success = await this.petRepo.deleteMedia(mediaId, petId, shelterId);
    if (success) {
      await this.logAudit(shelterId, "UPDATE", petId, {
        action: "DELETE_MEDIA",
        mediaId,
      });
    }

    return success;
  }

  private async logAudit(
    shelterId: string,
    action: AuditAction,
    entityId: string,
    details: unknown
  ): Promise<void> {
    if (!this.auditLogRepo) return;
    try {
      await this.auditLogRepo.append({
        shelterId,
        entityType: "PET",
        entityId,
        action,
        actorType: "OPERATOR",
        actorId: "local-operator",
        details: typeof details === "string" ? details : JSON.stringify(details),
      });
    } catch {
      // Non-blocking audit log failure
    }
  }
}
