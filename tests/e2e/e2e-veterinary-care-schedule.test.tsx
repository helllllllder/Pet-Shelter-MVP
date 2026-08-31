import { describe, it, expect, beforeEach } from "vitest";
import { createDatabase, type LunaDatabase } from "../../src/adapters/sqlite/database.js";
import { SqliteRepositoryFactory } from "../../src/adapters/sqlite/repositories/index.js";
import { ShelterAppFacadeImpl } from "../../packages/app-core/src/facade.js";

describe("E2E: Veterinary Directory & Care Scheduling (US 33-50)", () => {
  let db: LunaDatabase;
  let factory: SqliteRepositoryFactory;
  let facade: ShelterAppFacadeImpl;
  let shelterId: string;
  let petId: string;

  beforeEach(async () => {
    const initialized = createDatabase(":memory:");
    db = initialized.db;
    factory = new SqliteRepositoryFactory(db);
    facade = new ShelterAppFacadeImpl(factory);

    const shelter = await facade.createShelter("Veterinary Care Center");
    shelterId = shelter.id;

    const pet = await facade.registerPet(shelterId, {
      name: "Oliver",
      dateOfBirth: "2020-02-14",
      estimatedDOB: false,
      species: "Cat",
      intakeOrigin: "StreetRescue",
      healthConditions: [],
      healthStatus: "InTreatment",
      status: "active",
      availableForAdoption: false,
    });
    petId = pet.id;
  });

  it("manages clinics, veterinarians, appointments with retroactive warning, and document uploads", async () => {
    // 1. Register clinic and veterinarian
    const clinic = await facade.createClinic(shelterId, {
      name: "Sunset Pet Hospital",
      address: "500 Ocean Ave",
      phone: "555-8888",
    });

    const vet = await facade.createVet(shelterId, {
      clinicId: clinic.id,
      name: "Dr. Gregory House",
      specialization: "Internal Medicine",
    });

    expect(clinic.id).toBeDefined();
    expect(vet.id).toBeDefined();

    // 2. Schedule past-dated appointment (warning/retroactive flag US 40)
    const pastAppt = await facade.createAppointment(shelterId, {
      petId,
      clinicId: clinic.id,
      veterinarianId: vet.id,
      scheduledAt: "2023-05-01T10:00:00.000Z",
      notes: "Intake physical exam",
    });
    expect(pastAppt.isRetroactive).toBe(true);

    // 3. Schedule future appointment
    const futureAppt = await facade.createAppointment(shelterId, {
      petId,
      clinicId: clinic.id,
      veterinarianId: vet.id,
      scheduledAt: "2028-11-15T14:00:00.000Z",
      notes: "Annual wellness checkup",
    });
    expect(futureAppt.isRetroactive).toBe(false);

    // 4. Attach medical documents
    const doc = await facade.uploadAppointmentDocument?.(shelterId, pastAppt.id, {
      fileName: "lab_diagnostics.pdf",
      mimeType: "application/pdf",
      fileSizeBytes: 2048,
      buffer: Buffer.from("PDF-DATA"),
    });
    expect(doc?.id).toBeDefined();
    expect(doc?.fileName).toBe("lab_diagnostics.pdf");

    // 5. Verify soft delete preserves past appointment reference (US 37)
    const deletedClinic = await facade.deleteClinic?.(shelterId, clinic.id);
    expect(deletedClinic).toBe(true);

    const appointments = await facade.listAppointments(petId, shelterId);
    expect(appointments).toHaveLength(2);
    expect(appointments[0].clinicId).toBe(clinic.id);
  });

  it("handles recurring interval projections and temporary treatment course completion", async () => {
    // 1. Temporary 5-day medication course (daily)
    const startDate = "2025-07-01T08:00:00.000Z";
    const endDate = "2025-07-05T08:00:00.000Z";

    const careEvent = await facade.createCareEvent(shelterId, {
      petId,
      modality: "Medication",
      substance: "Prednisone",
      startDate,
      temporaryEndDate: endDate,
      recurrenceRule: {
        interval: 1,
        unit: "days",
      },
    });

    expect(careEvent.id).toBeDefined();

    const occurrences = await facade.listCareOccurrences?.(petId, shelterId);
    expect(occurrences).toHaveLength(5);
    expect(occurrences![0].scheduledDate).toBe(startDate);
    expect(occurrences![4].scheduledDate).toBe(endDate);

    // 2. Mark day 1 completed
    const completed = await facade.completeCareOccurrence?.(
      shelterId,
      occurrences![0].id,
      "2025-07-01T08:10:00.000Z",
      "Dose administered with treats"
    );
    expect(completed?.status).toBe("Completed");
    expect(completed?.notes).toBe("Dose administered with treats");

    // 3. Skip day 2
    const skipped = await facade.skipCareOccurrence?.(
      shelterId,
      occurrences![1].id,
      "Skipped due to vomiting"
    );
    expect(skipped?.status).toBe("Skipped");
  });
});
