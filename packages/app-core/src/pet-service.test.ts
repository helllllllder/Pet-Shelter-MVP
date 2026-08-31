import { describe, it, expect, beforeEach } from "vitest";
import { createDatabase } from "../../adapter-sqlite/src/index.js";
import { SqliteRepositoryFactory } from "../../adapter-sqlite/src/index.js";
import { PetService } from "./pet-service.js";
import { generateUUIDv7 } from "../../domain/src/index.js";

describe("@luna/app-core PetService", () => {
  it("should initialize PetService and register a pet", async () => {
    const { db } = createDatabase(":memory:");
    const factory = new SqliteRepositoryFactory(db);
    const service = new PetService(factory.petRepo, factory.auditLogRepo);

    const shelterId = generateUUIDv7();
    await factory.shelterRepo.create({
      id: shelterId,
      name: "Core App Shelter",
      description: null,
      isActive: true,
    });

    const pet = await service.registerPet(shelterId, {
      name: "Oliver",
      dob: "2023-01-01",
      isDobEstimated: false,
      species: "Cat",
      breed: "Tabby",
      sex: "Male",
      color: "Striped",
      intakeOrigin: "STREET_RESCUE",
      healthStatus: "Healthy",
      availableForAdoption: true,
    });

    expect(pet.name).toBe("Oliver");
    expect(pet.shelterId).toBe(shelterId);

    const retrieved = await service.getPet(pet.id, shelterId);
    expect(retrieved?.name).toBe("Oliver");
  });
});
