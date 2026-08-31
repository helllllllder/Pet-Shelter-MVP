import type { IPetRepository } from "../../../src/core/contracts/pet-repository.js";
import type { ICareEventRepository } from "../../../src/core/contracts/care-event-repository.js";
import type { IAuditLogRepository } from "../../../src/core/contracts/audit-log-repository.js";
import type {
  Pet,
  AdopterDetails,
  AuditAction,
} from "../../../src/core/domain/models.js";
import { generateUUIDv7 } from "../../../src/core/domain/uuid.js";

export interface AdopterInput {
  name: string;
  phone: string;
  address: string;
}

export class PetLifecycleService {
  constructor(
    private readonly petRepo: IPetRepository,
    private readonly careEventRepo: ICareEventRepository,
    private readonly auditLogRepo?: IAuditLogRepository
  ) {}

  private async getActivePet(petId: string, shelterId: string): Promise<Pet> {
    const pet = await this.petRepo.findById(petId, shelterId);
    if (!pet) {
      throw new Error(`Pet with ID ${petId} not found in shelter ${shelterId}`);
    }
    if (pet.isArchived) {
      throw new Error("Cannot transition an already archived pet");
    }
    return pet;
  }

  async placeInFoster(petId: string, shelterId: string): Promise<Pet> {
    await this.getActivePet(petId, shelterId);

    const updated = await this.petRepo.update({
      id: petId,
      shelterId,
      outcomeStatus: "In Foster",
    });

    await this.logAudit(shelterId, "UPDATE", petId, {
      status: "In Foster",
    });

    return updated;
  }

  async returnFromFoster(petId: string, shelterId: string): Promise<Pet> {
    const pet = await this.getActivePet(petId, shelterId);

    if (pet.outcomeStatus !== "In Foster") {
      throw new Error("Pet is not in foster status");
    }

    const updated = await this.petRepo.update({
      id: petId,
      shelterId,
      outcomeStatus: null,
    });

    await this.logAudit(shelterId, "UPDATE", petId, {
      status: "Active",
    });

    return updated;
  }

  async recordAdoption(
    petId: string,
    shelterId: string,
    adopter: AdopterInput
  ): Promise<{ pet: Pet; adopter: AdopterDetails }> {
    if (!adopter.name || adopter.name.trim().length === 0) {
      throw new Error("Adopter name is required");
    }
    if (!adopter.phone || adopter.phone.trim().length === 0) {
      throw new Error("Adopter phone is required");
    }
    if (!adopter.address || adopter.address.trim().length === 0) {
      throw new Error("Adopter address is required");
    }

    await this.getActivePet(petId, shelterId);

    const savedAdopter = await this.petRepo.saveAdopterDetails({
      id: generateUUIDv7(),
      shelterId,
      petId,
      name: adopter.name.trim(),
      phone: adopter.phone.trim(),
      address: adopter.address.trim(),
    });

    const updatedPet = await this.archivePetOutcome(petId, shelterId, "Adopted", {
      outcome: "Adopted",
      adopter: savedAdopter.name,
    });

    return { pet: updatedPet, adopter: savedAdopter };
  }

  async recordDeceased(
    petId: string,
    shelterId: string,
    reason?: string
  ): Promise<Pet> {
    await this.getActivePet(petId, shelterId);
    return this.archivePetOutcome(petId, shelterId, "Deceased", {
      outcome: "Deceased",
      reason: reason || null,
    });
  }

  async recordExternalTransfer(
    petId: string,
    shelterId: string,
    destination?: string
  ): Promise<Pet> {
    await this.getActivePet(petId, shelterId);
    return this.archivePetOutcome(petId, shelterId, "Transferred (External)", {
      outcome: "Transferred (External)",
      destination: destination || null,
    });
  }

  private async archivePetOutcome(
    petId: string,
    shelterId: string,
    outcomeStatus: Pet["outcomeStatus"],
    auditDetails: unknown
  ): Promise<Pet> {
    const now = new Date().toISOString();

    const updated = await this.petRepo.update({
      id: petId,
      shelterId,
      outcomeStatus,
      outcomeDate: now,
      isArchived: true,
      availableForAdoption: false,
    });

    // Automatically cancel all pending care event occurrences upon archival
    await this.careEventRepo.cancelAllPetOccurrences(petId, shelterId);

    // Cancel all recurring parent care events for this pet
    const careEvents = await this.careEventRepo.listByPet(petId, shelterId);
    for (const event of careEvents) {
      if (event.status === "ACTIVE") {
        await this.careEventRepo.update({
          id: event.id,
          shelterId,
          status: "CANCELLED",
        });
      }
    }

    await this.logAudit(shelterId, "ARCHIVE", petId, auditDetails);
    return updated;
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
      // Non-blocking audit failure
    }
  }
}
