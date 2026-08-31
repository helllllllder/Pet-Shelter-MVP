import { describe, it, expect } from "vitest";
import { createDatabase } from "../../adapter-sqlite/src/index.js";
import { SqliteRepositoryFactory } from "../../adapter-sqlite/src/index.js";
import { PetLifecycleService } from "./pet-lifecycle-service.js";
import { generateUUIDv7 } from "../../domain/src/index.js";

describe("@luna/app-core PetLifecycleService", () => {
  it("should handle full lifecycle from active to foster and adoption", async () => {
    const { db } = createDatabase(":memory:");
    const factory = new SqliteRepositoryFactory(db);
    const service = new PetLifecycleService(
      factory.petRepo,
      factory.careEventRepo,
      factory.auditLogRepo
    );

    const shelterId = generateUUIDv7();
    const petId = generateUUIDv7();

    await factory.shelterRepo.create({
      id: shelterId,
      name: "App Core Shelter",
      description: null,
      isActive: true,
    });

    await factory.petRepo.create({
      id: petId,
      shelterId,
      name: "Toby",
      dob: "2022-01-01",
      isDobEstimated: false,
      species: "Dog",
      breed: "Beagle",
      sex: "Male",
      color: "Tricolor",
      intakeOrigin: "STREET_RESCUE",
      intakeOriginDetail: null,
      healthConditions: null,
      healthStatus: "Healthy",
      availableForAdoption: true,
      outcomeStatus: null,
      outcomeDate: null,
      isArchived: false,
    });

    // 1. In Foster
    const fostered = await service.placeInFoster(petId, shelterId);
    expect(fostered.outcomeStatus).toBe("In Foster");
    expect(fostered.availableForAdoption).toBe(true);

    // 2. Return from foster
    const active = await service.returnFromFoster(petId, shelterId);
    expect(active.outcomeStatus).toBeNull();

    // 3. Adopt
    const adopted = await service.recordAdoption(petId, shelterId, {
      name: "Alice Smith",
      phone: "555-9876",
      address: "456 Oak Avenue",
    });

    expect(adopted.pet.outcomeStatus).toBe("Adopted");
    expect(adopted.pet.isArchived).toBe(true);
    expect(adopted.adopter.name).toBe("Alice Smith");
  });
});
