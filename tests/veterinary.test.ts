import { describe, it, expect, beforeEach } from "vitest";
import { createDatabase, type LunaDatabase } from "../src/adapters/sqlite/database.js";
import { SqliteRepositoryFactory } from "../src/adapters/sqlite/repositories/index.js";
import { VeterinaryService } from "../packages/app-core/src/veterinary-service.js";
import { ShelterAppFacadeImpl } from "../packages/app-core/src/facade.js";

describe("Veterinary Directory & Appointments (Ticket T09 / #30 / US 33-43)", () => {
  let db: LunaDatabase;
  let factory: SqliteRepositoryFactory;
  let vetService: VeterinaryService;
  let facade: ShelterAppFacadeImpl;
  let shelterId: string;
  let petId: string;

  beforeEach(async () => {
    const initialized = createDatabase(":memory:");
    db = initialized.db;
    factory = new SqliteRepositoryFactory(db);
    vetService = new VeterinaryService(
      factory.vetDirectoryRepo,
      factory.appointmentRepo,
      factory.auditLogRepo
    );
    facade = new ShelterAppFacadeImpl(factory);

    const shelter = await facade.createShelter("Partner Veterinary Shelter");
    shelterId = shelter.id;

    const pet = await facade.registerPet(shelterId, {
      name: "Buddy",
      dateOfBirth: "2021-06-01",
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

  describe("1. Partner Clinic Management (US 33, 35, 36, 37, 38)", () => {
    it("should create, update, search, and retrieve veterinary clinics", async () => {
      const clinic = await facade.createClinic(shelterId, {
        name: "Central Animal Hospital",
        address: "123 Main St",
        phone: "555-1000",
        email: "contact@centralanimal.com",
      });

      expect(clinic.id).toBeDefined();
      expect(clinic.name).toBe("Central Animal Hospital");
      expect(clinic.isDeleted).toBe(false);

      // Search
      const searchResults = await facade.listClinics(shelterId, "Central");
      expect(searchResults).toHaveLength(1);
      expect(searchResults[0].name).toBe("Central Animal Hospital");

      // Update
      const updated = await vetService.updateClinic(shelterId, clinic.id, {
        name: "Central Regional Animal Hospital",
      });
      expect(updated.name).toBe("Central Regional Animal Hospital");
    });

    it("should soft-delete clinic and exclude it from active list", async () => {
      const unrefClinic = await facade.createClinic(shelterId, {
        name: "Temporary Clinic",
        phone: "555-2222",
      });

      const deletedUnref = await vetService.deleteClinic(shelterId, unrefClinic.id);
      expect(deletedUnref).toBe(true);

      const listAfterDelete = await facade.listClinics(shelterId);
      expect(listAfterDelete.find((c) => c.id === unrefClinic.id)).toBeUndefined();
    });
  });

  describe("2. Veterinarian Affiliation (US 34, 35, 36, 37, 38)", () => {
    it("should create, list by clinic, update, and delete veterinarians", async () => {
      const clinic = await facade.createClinic(shelterId, {
        name: "Metro Vet Clinic",
      });

      const vet = await facade.createVet(shelterId, {
        clinicId: clinic.id,
        name: "Dr. Sarah Jenkins",
        specialization: "General Practice",
        phone: "555-3000",
        email: "sarah.j@metrovet.com",
      });

      expect(vet.id).toBeDefined();
      expect(vet.clinicId).toBe(clinic.id);
      expect(vet.name).toBe("Dr. Sarah Jenkins");

      const vets = await facade.listVets(shelterId, clinic.id);
      expect(vets).toHaveLength(1);
      expect(vets[0].specialization).toBe("General Practice");

      const updatedVet = await vetService.updateVeterinarian(shelterId, vet.id, {
        specialization: "Soft Tissue Surgery",
      });
      expect(updatedVet.specialization).toBe("Soft Tissue Surgery");

      const deleted = await vetService.deleteVeterinarian(shelterId, vet.id);
      expect(deleted).toBe(true);
    });
  });

  describe("3. Appointments & Retroactive Warning (US 39, 40, 41)", () => {
    it("should flag past-dated appointments as retroactive and future appointments as normal", async () => {
      const clinic = await facade.createClinic(shelterId, {
        name: "Valley Vet",
      });

      // Past appointment (Retroactive)
      const pastDate = "2023-01-15T10:00:00.000Z";
      const pastAppt = await facade.createAppointment(shelterId, {
        petId,
        clinicId: clinic.id,
        scheduledAt: pastDate,
        notes: "Historical checkup before shelter intake",
      });

      expect(pastAppt.isRetroactive).toBe(true);

      // Future appointment
      const futureDate = "2028-10-20T14:30:00.000Z";
      const futureAppt = await facade.createAppointment(shelterId, {
        petId,
        clinicId: clinic.id,
        scheduledAt: futureDate,
        notes: "Upcoming dental cleaning",
      });

      expect(futureAppt.isRetroactive).toBe(false);

      // Chronological history timeline per pet
      const history = await facade.listAppointments(petId, shelterId);
      expect(history.length).toBeGreaterThanOrEqual(2);
    });
  });

  describe("4. Veterinary Document Attachments (US 42, 43)", () => {
    it("should upload and list valid medical documents attached to an appointment", async () => {
      const clinic = await facade.createClinic(shelterId, {
        name: "Valley Vet",
      });

      const appt = await facade.createAppointment(shelterId, {
        petId,
        clinicId: clinic.id,
        scheduledAt: "2024-04-10T09:00:00.000Z",
        notes: "Blood panel and x-rays",
      });

      const doc = await vetService.uploadAppointmentDocument(shelterId, appt.id, {
        fileName: "bloodwork_results.pdf",
        mimeType: "application/pdf",
        fileSizeBytes: 1024 * 50,
        buffer: Buffer.from("dummy-pdf-content"),
      });

      expect(doc.id).toBeDefined();
      expect(doc.appointmentId).toBe(appt.id);
      expect(doc.fileName).toBe("bloodwork_results.pdf");

      const documents = await vetService.listAppointmentDocuments(shelterId, appt.id);
      expect(documents).toHaveLength(1);
      expect(documents[0].fileName).toBe("bloodwork_results.pdf");
    });

    it("should reject unsupported document formats", async () => {
      const clinic = await facade.createClinic(shelterId, {
        name: "Valley Vet",
      });

      const appt = await facade.createAppointment(shelterId, {
        petId,
        clinicId: clinic.id,
        scheduledAt: "2024-04-10T09:00:00.000Z",
        notes: "General checkup",
      });

      await expect(
        vetService.uploadAppointmentDocument(shelterId, appt.id, {
          fileName: "notes.txt",
          mimeType: "text/plain",
          fileSizeBytes: 100,
          buffer: Buffer.from("plain text"),
        })
      ).rejects.toThrow("Unsupported document MIME type");
    });
  });
});
