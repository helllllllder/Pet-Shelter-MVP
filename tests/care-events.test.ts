import { describe, it, expect, beforeEach } from "vitest";
import { createDatabase, type LunaDatabase } from "../src/adapters/sqlite/database.js";
import { SqliteRepositoryFactory } from "../src/adapters/sqlite/repositories/index.js";
import { CareEventService } from "../packages/app-core/src/care-event-service.js";
import { ShelterAppFacadeImpl } from "../packages/app-core/src/facade.js";

describe("Care Events & Recurrence Engine (Ticket T10 / #31 / US 44-50)", () => {
  let db: LunaDatabase;
  let factory: SqliteRepositoryFactory;
  let careService: CareEventService;
  let facade: ShelterAppFacadeImpl;
  let shelterId: string;
  let petId: string;

  beforeEach(async () => {
    const initialized = createDatabase(":memory:");
    db = initialized.db;
    factory = new SqliteRepositoryFactory(db);
    careService = new CareEventService(factory.careEventRepo, factory.auditLogRepo);
    facade = new ShelterAppFacadeImpl(factory);

    const shelter = await facade.createShelter("Care Center Shelter");
    shelterId = shelter.id;

    const pet = await facade.registerPet(shelterId, {
      name: "Daisy",
      dateOfBirth: "2022-03-01",
      estimatedDOB: false,
      species: "Dog",
      intakeOrigin: "StreetRescue",
      healthConditions: [],
      healthStatus: "Healthy",
      status: "active",
      availableForAdoption: true,
    });
    petId = pet.id;
  });

  describe("1. Single & Recurring Care Event Generation (US 44, 45)", () => {
    it("should schedule a one-time care event and generate a single occurrence", async () => {
      const startDate = "2025-05-01T09:00:00.000Z";
      const event = await facade.createCareEvent(shelterId, {
        petId,
        modality: "Vaccine",
        substance: "Rabies",
        instructions: "Subcutaneous injection",
        dueDate: startDate,
      });

      expect(event.id).toBeDefined();
      expect(event.modality).toBe("Vaccine");

      const occurrences = await facade.listCareOccurrences?.(petId, shelterId);
      expect(occurrences).toHaveLength(1);
      expect(occurrences![0].careEventId).toBe(event.id);
      expect(occurrences![0].scheduledDate).toBe(startDate);
      expect(occurrences![0].status).toBe("Pending");
    });

    it("should project multiple future occurrences for recurring care events", async () => {
      const startDate = "2025-01-01T08:00:00.000Z";
      const event = await facade.createCareEvent(shelterId, {
        petId,
        modality: "Vermifuge",
        substance: "BroadSpectrumDewormer",
        startDate,
        recurrenceRule: {
          interval: 3,
          unit: "months",
        },
      });

      expect(event.id).toBeDefined();
      const occurrences = await facade.listCareOccurrences?.(petId, shelterId);
      expect(occurrences!.length).toBeGreaterThanOrEqual(4);
      expect(occurrences![0].scheduledDate).toBe(startDate);
      expect(new Date(occurrences![1].scheduledDate).getMonth()).toBe(new Date("2025-04-01T08:00:00.000Z").getMonth());
      expect(new Date(occurrences![2].scheduledDate).getMonth()).toBe(new Date("2025-07-01T08:00:00.000Z").getMonth());
      expect(new Date(occurrences![3].scheduledDate).getMonth()).toBe(new Date("2025-10-01T08:00:00.000Z").getMonth());
    });
  });

  describe("2. Temporary Care Event Courses (US 46)", () => {
    it("should generate occurrences only up to the specified end date", async () => {
      const startDate = "2025-06-01T08:00:00.000Z";
      const endDate = "2025-06-07T08:00:00.000Z"; // 7-day course (daily)

      const event = await facade.createCareEvent(shelterId, {
        petId,
        modality: "Medication",
        substance: "Amoxicillin",
        instructions: "Give with food every 24h",
        startDate,
        temporaryEndDate: endDate,
        recurrenceRule: {
          interval: 1,
          unit: "days",
        },
      });

      expect(event.id).toBeDefined();
      const occurrences = await facade.listCareOccurrences?.(petId, shelterId);
      expect(occurrences).toHaveLength(7);
      expect(occurrences![0].scheduledDate).toBe(startDate);
      expect(occurrences![6].scheduledDate).toBe(endDate);
    });
  });

  describe("3. Occurrence Execution & Status Transitions (US 47, 48, 49)", () => {
    it("should mark an occurrence as completed with actual completion time and notes", async () => {
      const startDate = "2025-01-01T10:00:00.000Z";
      const event = await facade.createCareEvent(shelterId, {
        petId,
        modality: "Medication",
        substance: "Ear Drops",
        startDate,
      });

      const occurrences = await facade.listCareOccurrences?.(petId, shelterId);
      const targetOcc = occurrences![0];

      const completedAt = "2025-01-01T10:15:00.000Z";
      const updated = await facade.completeCareOccurrence?.(
        shelterId,
        targetOcc.id,
        completedAt,
        "Administered without issue"
      );

      expect(updated?.status).toBe("Completed");
      expect(updated?.actualDate).toBe(completedAt);
      expect(updated?.notes).toBe("Administered without issue");
    });

    it("should allow skipping an occurrence with notes", async () => {
      const startDate = "2025-01-01T10:00:00.000Z";
      const event = await facade.createCareEvent(shelterId, {
        petId,
        modality: "Grooming",
        substance: "Bath",
        startDate,
      });

      const occurrences = await facade.listCareOccurrences?.(petId, shelterId);
      const targetOcc = occurrences![0];

      const skipped = await facade.skipCareOccurrence?.(
        shelterId,
        targetOcc.id,
        "Pet was agitated, rescheduled"
      );

      expect(skipped?.status).toBe("Skipped");
      expect(skipped?.notes).toBe("Pet was agitated, rescheduled");
    });

    it("should cancel a single care occurrence", async () => {
      const startDate = "2025-01-01T10:00:00.000Z";
      const event = await facade.createCareEvent(shelterId, {
        petId,
        modality: "Grooming",
        substance: "Nail Trim",
        startDate,
      });

      const occurrences = await facade.listCareOccurrences?.(petId, shelterId);
      const targetOcc = occurrences![0];

      const cancelled = await facade.cancelCareOccurrence?.(shelterId, targetOcc.id);
      expect(cancelled?.status).toBe("Cancelled");
    });

    it("should cancel a care event and all future pending occurrences", async () => {
      const startDate = "2025-01-01T08:00:00.000Z";
      const event = await facade.createCareEvent(shelterId, {
        petId,
        modality: "PhysicalTherapy",
        substance: "Leg exercises",
        startDate,
        recurrenceRule: {
          interval: 1,
          unit: "days",
        },
      });

      // Complete first occurrence
      const occurrences = await facade.listCareOccurrences?.(petId, shelterId);
      await facade.completeCareOccurrence?.(shelterId, occurrences![0].id);

      // Cancel series
      const cancelledCount = await facade.cancelCareEvent?.(shelterId, event.id);
      expect(cancelledCount).toBeGreaterThan(0);

      const updatedOccurrences = await facade.listCareOccurrences?.(petId, shelterId);
      expect(updatedOccurrences?.find((o) => o.id === occurrences![0].id)?.status).toBe("Completed");
      expect(updatedOccurrences?.filter((o) => o.status === "Cancelled").length).toBe(cancelledCount);
    });
  });

  describe("4. Local Alerts & Notification Generation (US 50)", () => {
    it("should list due occurrences and generate local notification payloads", async () => {
      const dueTimestamp = "2025-04-01T09:00:00.000Z";
      await facade.createCareEvent(shelterId, {
        petId,
        modality: "Vaccine",
        substance: "DHPP",
        startDate: dueTimestamp,
      });

      const evaluationTime = "2025-04-01T12:00:00.000Z";
      const dueOccurrences = await facade.listDueCareOccurrences?.(shelterId, evaluationTime);
      expect(dueOccurrences).toHaveLength(1);

      const rawOccs = await careService.listDueOccurrences(shelterId, evaluationTime);
      const notifications = careService.generateNotificationPayloads(rawOccs, {
        petName: "Daisy",
        modality: "Vaccine",
        substance: "DHPP",
      });
      expect(notifications).toHaveLength(1);
      expect(notifications[0].title).toContain("Due Care: Vaccine");
      expect(notifications[0].body).toContain("Daisy");
      expect(notifications[0].body).toContain("DHPP");
    });
  });
});
