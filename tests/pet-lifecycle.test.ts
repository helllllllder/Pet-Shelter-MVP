import { describe, it, expect, beforeEach } from "vitest";
import { createDatabase, type LunaDatabase } from "../src/adapters/sqlite/database.js";
import { SqliteRepositoryFactory } from "../src/adapters/sqlite/repositories/index.js";
import { PetLifecycleService } from "../packages/app-core/src/pet-lifecycle-service.js";
import { generateUUIDv7 } from "../src/core/domain/uuid.js";

describe("Pet Lifecycle & Outcomes (Ticket T08 / #26)", () => {
  let db: LunaDatabase;
  let factory: SqliteRepositoryFactory;
  let lifecycleService: PetLifecycleService;
  let shelterId: string;
  let petId: string;

  beforeEach(async () => {
    const initialized = createDatabase(":memory:");
    db = initialized.db;
    factory = new SqliteRepositoryFactory(db);
    lifecycleService = new PetLifecycleService(
      factory.petRepo,
      factory.careEventRepo,
      factory.auditLogRepo
    );

    shelterId = generateUUIDv7();
    petId = generateUUIDv7();

    await factory.shelterRepo.create({
      id: shelterId,
      name: "Sunny Meadows Shelter",
      description: "Main Shelter",
      isActive: true,
    });

    await factory.petRepo.create({
      id: petId,
      shelterId,
      name: "Bella",
      dob: "2021-06-01",
      isDobEstimated: false,
      species: "Dog",
      breed: "Labrador",
      sex: "Female",
      color: "Golden",
      intakeOrigin: "STREET_RESCUE",
      intakeOriginDetail: null,
      healthConditions: null,
      healthStatus: "Healthy",
      availableForAdoption: true,
      outcomeStatus: null,
      outcomeDate: null,
      isArchived: false,
    });
  });

  describe("1. Foster Placement & Lossless Reversibility (FR08, User Stories 25-26)", () => {
    it("should place active pet into In Foster status losslessly", async () => {
      const updated = await lifecycleService.placeInFoster(petId, shelterId);

      expect(updated.outcomeStatus).toBe("In Foster");
      expect(updated.isArchived).toBe(false);
      expect(updated.availableForAdoption).toBe(true);

      const found = await factory.petRepo.findById(petId, shelterId);
      expect(found?.outcomeStatus).toBe("In Foster");
      expect(found?.availableForAdoption).toBe(true);

      const logs = await factory.auditLogRepo.listByShelter(shelterId);
      expect(logs).toHaveLength(1);
      expect(logs[0].action).toBe("UPDATE");
    });

    it("should return pet from In Foster status back to Active losslessly", async () => {
      await lifecycleService.placeInFoster(petId, shelterId);

      const returned = await lifecycleService.returnFromFoster(petId, shelterId);
      expect(returned.outcomeStatus).toBeNull();
      expect(returned.isArchived).toBe(false);
      expect(returned.availableForAdoption).toBe(true);

      const found = await factory.petRepo.findById(petId, shelterId);
      expect(found?.outcomeStatus).toBeNull();
      expect(found?.availableForAdoption).toBe(true);
    });

    it("should reject returning a pet that is not In Foster", async () => {
      await expect(
        lifecycleService.returnFromFoster(petId, shelterId)
      ).rejects.toThrow(/not in foster/i);
    });
  });

  describe("2. Adoption Outcome & Mandatory Adopter Details (FR09, User Stories 27-28)", () => {
    it("should record adoption, persist adopter details, archive pet, and cancel pending care events", async () => {
      // Schedule a recurring care event and pending occurrence
      const careEventId = generateUUIDv7();
      const occId = generateUUIDv7();

      await factory.careEventRepo.create({
        id: careEventId,
        shelterId,
        petId,
        appointmentId: null,
        modality: "Vaccine",
        substance: "Rabies Booster",
        instructions: "Annual shot",
        isRecurring: true,
        recurrenceIntervalValue: 1,
        recurrenceIntervalUnit: "years",
        isTemporary: false,
        startDate: "2024-01-01T00:00:00.000Z",
        endDate: null,
        status: "ACTIVE",
      });

      await factory.careEventRepo.createOccurrences([
        {
          id: occId,
          shelterId,
          careEventId,
          petId,
          dueDate: "2025-01-01T00:00:00.000Z",
          status: "PENDING",
          completedAt: null,
          notes: null,
        },
      ]);

      const result = await lifecycleService.recordAdoption(petId, shelterId, {
        name: "Jane Doe",
        phone: "555-4321",
        address: "789 Pine Rd, Springfield",
      });

      expect(result.pet.outcomeStatus).toBe("Adopted");
      expect(result.pet.isArchived).toBe(true);
      expect(result.pet.outcomeDate).toBeDefined();
      expect(result.pet.availableForAdoption).toBe(false);

      expect(result.adopter.name).toBe("Jane Doe");
      expect(result.adopter.phone).toBe("555-4321");
      expect(result.adopter.address).toBe("789 Pine Rd, Springfield");

      // Verify adopter details persisted
      const savedAdopter = await factory.petRepo.getAdopterDetails(petId, shelterId);
      expect(savedAdopter?.name).toBe("Jane Doe");

      // Verify pending care occurrences were automatically cancelled
      const occurrences = await factory.careEventRepo.listOccurrencesByPet(petId, shelterId);
      expect(occurrences).toHaveLength(1);
      expect(occurrences[0].status).toBe("CANCELLED");
    });

    it("should reject adoption if adopter details are incomplete", async () => {
      await expect(
        lifecycleService.recordAdoption(petId, shelterId, {
          name: "",
          phone: "555-1234",
          address: "123 Main St",
        })
      ).rejects.toThrow(/adopter name is required/i);

      await expect(
        lifecycleService.recordAdoption(petId, shelterId, {
          name: "Jane Doe",
          phone: "",
          address: "123 Main St",
        })
      ).rejects.toThrow(/adopter phone is required/i);

      await expect(
        lifecycleService.recordAdoption(petId, shelterId, {
          name: "Jane Doe",
          phone: "555-1234",
          address: "",
        })
      ).rejects.toThrow(/adopter address is required/i);
    });
  });

  describe("3. Deceased Outcome (User Story 29)", () => {
    it("should record deceased outcome, archive pet, and cancel pending care events", async () => {
      const careEventId = generateUUIDv7();
      await factory.careEventRepo.create({
        id: careEventId,
        shelterId,
        petId,
        appointmentId: null,
        modality: "Medication",
        substance: "Pain relief",
        instructions: "Daily",
        isRecurring: false,
        recurrenceIntervalValue: null,
        recurrenceIntervalUnit: null,
        isTemporary: false,
        startDate: "2023-01-01T00:00:00.000Z",
        endDate: null,
        status: "ACTIVE",
      });

      await factory.careEventRepo.createOccurrences([
        {
          id: generateUUIDv7(),
          shelterId,
          careEventId,
          petId,
          dueDate: "2023-01-02T00:00:00.000Z",
          status: "PENDING",
          completedAt: null,
          notes: null,
        },
      ]);

      const deceasedPet = await lifecycleService.recordDeceased(petId, shelterId, "Old age");
      expect(deceasedPet.outcomeStatus).toBe("Deceased");
      expect(deceasedPet.isArchived).toBe(true);
      expect(deceasedPet.availableForAdoption).toBe(false);

      const occurrences = await factory.careEventRepo.listOccurrencesByPet(petId, shelterId);
      expect(occurrences[0].status).toBe("CANCELLED");
    });
  });

  describe("4. External Transfer Outcome (User Story 30)", () => {
    it("should record external transfer, archive pet, and cancel pending care events", async () => {
      const transferredPet = await lifecycleService.recordExternalTransfer(
        petId,
        shelterId,
        "Partner Shelter North"
      );

      expect(transferredPet.outcomeStatus).toBe("Transferred (External)");
      expect(transferredPet.isArchived).toBe(true);
      expect(transferredPet.availableForAdoption).toBe(false);
    });
  });

  describe("5. Archival Invariants & Terminal States (User Stories 31-32)", () => {
    it("should reject transitions on already archived pets", async () => {
      await lifecycleService.recordDeceased(petId, shelterId);

      await expect(
        lifecycleService.placeInFoster(petId, shelterId)
      ).rejects.toThrow(/already archived/i);

      await expect(
        lifecycleService.recordAdoption(petId, shelterId, {
          name: "Test",
          phone: "123",
          address: "123",
        })
      ).rejects.toThrow(/already archived/i);
    });
  });
});
