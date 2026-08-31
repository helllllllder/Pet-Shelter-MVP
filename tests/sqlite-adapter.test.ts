import { describe, it, expect, beforeEach } from "vitest";
import { createDatabase, type LunaDatabase } from "../src/adapters/sqlite/database.js";
import {
  SqliteOperatorRepository,
  SqliteShelterRepository,
  SqlitePetRepository,
  SqliteVetDirectoryRepository,
  SqliteAppointmentRepository,
  SqliteCareEventRepository,
  SqliteAuditLogRepository,
  SqliteRepositoryFactory,
} from "../src/adapters/sqlite/repositories/index.js";
import { generateUUIDv7 } from "../src/core/domain/uuid.js";

describe("SQLite Persistence Adapter & Shelter Scoping (Ticket T04 / #24)", () => {
  let db: LunaDatabase;
  let factory: SqliteRepositoryFactory;

  beforeEach(() => {
    const initialized = createDatabase(":memory:");
    db = initialized.db;
    factory = new SqliteRepositoryFactory(db);
  });

  describe("Operator Repository", () => {
    it("should return null when operator profile does not exist", async () => {
      const repo = factory.operatorRepo;
      const profile = await repo.getProfile();
      expect(profile).toBeNull();
    });

    it("should save and retrieve operator profile", async () => {
      const repo = factory.operatorRepo;
      const id = generateUUIDv7();
      const saved = await repo.saveProfile({
        id,
        name: "Helder Souza",
        email: "helder@example.com",
      });

      expect(saved.id).toBe(id);
      expect(saved.name).toBe("Helder Souza");
      expect(saved.email).toBe("helder@example.com");
      expect(saved.createdAt).toBeDefined();
      expect(saved.updatedAt).toBeDefined();

      const retrieved = await repo.getProfile();
      expect(retrieved).toEqual(saved);
    });

    it("should update operator profile", async () => {
      const repo = factory.operatorRepo;
      const id = generateUUIDv7();
      await repo.saveProfile({
        id,
        name: "Helder",
        email: "old@example.com",
      });

      const updated = await repo.updateProfile({
        id,
        name: "Helder Updated",
        email: "new@example.com",
      });

      expect(updated.name).toBe("Helder Updated");
      expect(updated.email).toBe("new@example.com");

      const retrieved = await repo.getProfile();
      expect(retrieved?.name).toBe("Helder Updated");
      expect(retrieved?.email).toBe("new@example.com");
    });
  });

  describe("Shelter Repository", () => {
    it("should create and retrieve shelter by ID", async () => {
      const repo = factory.shelterRepo;
      const shelterId = generateUUIDv7();

      const shelter = await repo.create({
        id: shelterId,
        name: "Happy Paws Shelter",
        description: "Main downtown shelter",
        isActive: true,
      });

      expect(shelter.id).toBe(shelterId);
      expect(shelter.name).toBe("Happy Paws Shelter");
      expect(shelter.description).toBe("Main downtown shelter");
      expect(shelter.isActive).toBe(true);

      const found = await repo.findById(shelterId);
      expect(found).toEqual(shelter);
    });

    it("should update shelter details", async () => {
      const repo = factory.shelterRepo;
      const shelterId = generateUUIDv7();

      await repo.create({
        id: shelterId,
        name: "Old Shelter Name",
        description: "Old description",
        isActive: true,
      });

      const updated = await repo.update({
        id: shelterId,
        name: "New Shelter Name",
        description: "Updated description",
        isActive: false,
      });

      expect(updated.name).toBe("New Shelter Name");
      expect(updated.description).toBe("Updated description");
      expect(updated.isActive).toBe(false);
    });

    it("should list all shelters", async () => {
      const repo = factory.shelterRepo;
      const s1 = await repo.create({
        id: generateUUIDv7(),
        name: "Shelter 1",
        description: null,
        isActive: true,
      });
      const s2 = await repo.create({
        id: generateUUIDv7(),
        name: "Shelter 2",
        description: "Second",
        isActive: true,
      });

      const all = await repo.listAll();
      expect(all).toHaveLength(2);
      expect(all.map((s) => s.id)).toContain(s1.id);
      expect(all.map((s) => s.id)).toContain(s2.id);
    });
  });

  describe("Pet Repository & Shelter Scoping", () => {
    let shelterAId: string;
    let shelterBId: string;

    beforeEach(async () => {
      shelterAId = generateUUIDv7();
      shelterBId = generateUUIDv7();

      await factory.shelterRepo.create({
        id: shelterAId,
        name: "Shelter A",
        description: "A",
        isActive: true,
      });

      await factory.shelterRepo.create({
        id: shelterBId,
        name: "Shelter B",
        description: "B",
        isActive: true,
      });
    });

    it("should create pet and find by ID within active shelter", async () => {
      const petId = generateUUIDv7();
      const pet = await factory.petRepo.create({
        id: petId,
        shelterId: shelterAId,
        name: "Luna",
        dob: "2022-01-01",
        isDobEstimated: false,
        species: "Cat",
        breed: "Domestic Shorthair",
        sex: "Female",
        color: "Black",
        intakeOrigin: "STREET_RESCUE",
        intakeOriginDetail: null,
        healthConditions: JSON.stringify(["FIV-"]),
        healthStatus: "Healthy",
        availableForAdoption: true,
        outcomeStatus: null,
        outcomeDate: null,
        isArchived: false,
      });

      expect(pet.id).toBe(petId);
      expect(pet.name).toBe("Luna");

      // Finding within Shelter A succeeds
      const foundInA = await factory.petRepo.findById(petId, shelterAId);
      expect(foundInA).toEqual(pet);

      // Shelter isolation: Finding pet from Shelter A using Shelter B context returns null
      const foundInB = await factory.petRepo.findById(petId, shelterBId);
      expect(foundInB).toBeNull();
    });

    it("should search pets with filters scoped to shelter", async () => {
      const p1 = await factory.petRepo.create({
        id: generateUUIDv7(),
        shelterId: shelterAId,
        name: "Bella",
        dob: "2021-05-01",
        isDobEstimated: false,
        species: "Dog",
        breed: "Labrador",
        sex: "Female",
        color: "Golden",
        intakeOrigin: "OWNER_SURRENDER",
        intakeOriginDetail: null,
        healthConditions: null,
        healthStatus: "Healthy",
        availableForAdoption: true,
        outcomeStatus: null,
        outcomeDate: null,
        isArchived: false,
      });

      const p2 = await factory.petRepo.create({
        id: generateUUIDv7(),
        shelterId: shelterAId,
        name: "Max",
        dob: "2020-03-10",
        isDobEstimated: true,
        species: "Dog",
        breed: "Beagle",
        sex: "Male",
        color: "Tricolor",
        intakeOrigin: "STREET_RESCUE",
        intakeOriginDetail: null,
        healthConditions: null,
        healthStatus: "In Treatment",
        availableForAdoption: false,
        outcomeStatus: null,
        outcomeDate: null,
        isArchived: false,
      });

      // Pet in Shelter B
      await factory.petRepo.create({
        id: generateUUIDv7(),
        shelterId: shelterBId,
        name: "Bella In Shelter B",
        dob: "2021-01-01",
        isDobEstimated: false,
        species: "Dog",
        breed: "Poodle",
        sex: "Female",
        color: "White",
        intakeOrigin: "STREET_RESCUE",
        intakeOriginDetail: null,
        healthConditions: null,
        healthStatus: "Healthy",
        availableForAdoption: true,
        outcomeStatus: null,
        outcomeDate: null,
        isArchived: false,
      });

      // Search all in Shelter A
      const allInA = await factory.petRepo.search(shelterAId);
      expect(allInA).toHaveLength(2);

      // Search query "bell" (case insensitive) in Shelter A
      const searchBella = await factory.petRepo.search(shelterAId, { query: "bell" });
      expect(searchBella).toHaveLength(1);
      expect(searchBella[0].id).toBe(p1.id);

      // Filter available for adoption
      const availablePets = await factory.petRepo.search(shelterAId, { availableForAdoption: true });
      expect(availablePets).toHaveLength(1);
      expect(availablePets[0].id).toBe(p1.id);

      // Filter species
      const dogs = await factory.petRepo.search(shelterAId, { species: "Dog" });
      expect(dogs).toHaveLength(2);
    });

    it("should update pet and prevent cross-shelter mutations", async () => {
      const petId = generateUUIDv7();
      await factory.petRepo.create({
        id: petId,
        shelterId: shelterAId,
        name: "Rocky",
        dob: "2021-01-01",
        isDobEstimated: false,
        species: "Dog",
        breed: "Boxer",
        sex: "Male",
        color: "Brown",
        intakeOrigin: "STREET_RESCUE",
        intakeOriginDetail: null,
        healthConditions: null,
        healthStatus: "Healthy",
        availableForAdoption: false,
        outcomeStatus: null,
        outcomeDate: null,
        isArchived: false,
      });

      const updated = await factory.petRepo.update({
        id: petId,
        shelterId: shelterAId,
        name: "Rocky Balboa",
        availableForAdoption: true,
      });

      expect(updated.name).toBe("Rocky Balboa");
      expect(updated.availableForAdoption).toBe(true);

      // Attempting to update with wrong shelterId should throw or fail
      await expect(
        factory.petRepo.update({
          id: petId,
          shelterId: shelterBId,
          name: "Hacked",
        })
      ).rejects.toThrow();
    });

    it("should delete pet when not archived and prevent cross-shelter deletion", async () => {
      const petId = generateUUIDv7();
      await factory.petRepo.create({
        id: petId,
        shelterId: shelterAId,
        name: "Daisy",
        dob: "2022-01-01",
        isDobEstimated: false,
        species: "Dog",
        breed: "Mutt",
        sex: "Female",
        color: "White",
        intakeOrigin: "STREET_RESCUE",
        intakeOriginDetail: null,
        healthConditions: null,
        healthStatus: "Healthy",
        availableForAdoption: true,
        outcomeStatus: null,
        outcomeDate: null,
        isArchived: false,
      });

      // Deleting with Shelter B context should fail / return false
      const deletedFromB = await factory.petRepo.delete(petId, shelterBId);
      expect(deletedFromB).toBe(false);

      // Deleting with Shelter A succeeds
      const deletedFromA = await factory.petRepo.delete(petId, shelterAId);
      expect(deletedFromA).toBe(true);

      const notFound = await factory.petRepo.findById(petId, shelterAId);
      expect(notFound).toBeNull();
    });

    it("should manage pet media assets", async () => {
      const petId = generateUUIDv7();
      await factory.petRepo.create({
        id: petId,
        shelterId: shelterAId,
        name: "Daisy",
        dob: "2022-01-01",
        isDobEstimated: false,
        species: "Dog",
        breed: "Mutt",
        sex: "Female",
        color: "White",
        intakeOrigin: "STREET_RESCUE",
        intakeOriginDetail: null,
        healthConditions: null,
        healthStatus: "Healthy",
        availableForAdoption: true,
        outcomeStatus: null,
        outcomeDate: null,
        isArchived: false,
      });

      const mediaId = generateUUIDv7();
      const media = await factory.petRepo.addMedia({
        id: mediaId,
        shelterId: shelterAId,
        petId,
        mediaType: "PHOTO",
        filePath: "uploads/pets/daisy.jpg",
        mimeType: "image/jpeg",
        fileSizeBytes: 102400,
      });

      expect(media.id).toBe(mediaId);

      const mediaList = await factory.petRepo.getMedia(petId, shelterAId);
      expect(mediaList).toHaveLength(1);
      expect(mediaList[0].filePath).toBe("uploads/pets/daisy.jpg");

      const deleted = await factory.petRepo.deleteMedia(mediaId, petId, shelterAId);
      expect(deleted).toBe(true);

      const emptyList = await factory.petRepo.getMedia(petId, shelterAId);
      expect(emptyList).toHaveLength(0);
    });

    it("should manage adopter details", async () => {
      const petId = generateUUIDv7();
      await factory.petRepo.create({
        id: petId,
        shelterId: shelterAId,
        name: "Charlie",
        dob: "2021-01-01",
        isDobEstimated: false,
        species: "Dog",
        breed: "Mutt",
        sex: "Male",
        color: "Black",
        intakeOrigin: "STREET_RESCUE",
        intakeOriginDetail: null,
        healthConditions: null,
        healthStatus: "Healthy",
        availableForAdoption: true,
        outcomeStatus: null,
        outcomeDate: null,
        isArchived: false,
      });

      const adopterId = generateUUIDv7();
      const adopter = await factory.petRepo.saveAdopterDetails({
        id: adopterId,
        shelterId: shelterAId,
        petId,
        name: "John Doe",
        phone: "555-1234",
        address: "123 Maple St",
      });

      expect(adopter.name).toBe("John Doe");

      const retrieved = await factory.petRepo.getAdopterDetails(petId, shelterAId);
      expect(retrieved).toEqual(adopter);

      // Scoped isolation
      const fromB = await factory.petRepo.getAdopterDetails(petId, shelterBId);
      expect(fromB).toBeNull();
    });
  });

  describe("Vet Directory Repository & Soft Deletes", () => {
    let shelterId: string;

    beforeEach(async () => {
      shelterId = generateUUIDv7();
      await factory.shelterRepo.create({
        id: shelterId,
        name: "Vet Test Shelter",
        description: null,
        isActive: true,
      });
    });

    it("should create, update, search, and soft-delete clinics", async () => {
      const clinicId = generateUUIDv7();
      const clinic = await factory.vetDirectoryRepo.createClinic({
        id: clinicId,
        shelterId,
        name: "City Pet Hospital",
        address: "456 Oak St",
        phone: "555-9876",
        email: "contact@cityvet.org",
      });

      expect(clinic.name).toBe("City Pet Hospital");

      const updated = await factory.vetDirectoryRepo.updateClinic({
        id: clinicId,
        shelterId,
        name: "City Pet Hospital & Trauma Center",
      });
      expect(updated.name).toBe("City Pet Hospital & Trauma Center");

      const searchResults = await factory.vetDirectoryRepo.searchClinics(shelterId, "trauma");
      expect(searchResults).toHaveLength(1);

      // Soft delete
      const softDeleted = await factory.vetDirectoryRepo.softDeleteClinic(clinicId, shelterId);
      expect(softDeleted).toBe(true);

      // By default listClinics should exclude deleted
      const activeList = await factory.vetDirectoryRepo.listClinics(shelterId);
      expect(activeList).toHaveLength(0);

      // When includeDeleted is true
      const allList = await factory.vetDirectoryRepo.listClinics(shelterId, true);
      expect(allList).toHaveLength(1);
      expect(allList[0].isDeleted).toBe(true);
    });

    it("should manage veterinarians linked to clinics", async () => {
      const clinicId = generateUUIDv7();
      await factory.vetDirectoryRepo.createClinic({
        id: clinicId,
        shelterId,
        name: "Metro Vet",
        address: null,
        phone: null,
        email: null,
      });

      const vetId = generateUUIDv7();
      const vet = await factory.vetDirectoryRepo.createVeterinarian({
        id: vetId,
        shelterId,
        clinicId,
        name: "Dr. Alice Adams",
        specialization: "Surgery",
        phone: "555-1111",
        email: "alice@metrovet.org",
      });

      expect(vet.name).toBe("Dr. Alice Adams");

      const vets = await factory.vetDirectoryRepo.listVeterinariansByClinic(clinicId, shelterId);
      expect(vets).toHaveLength(1);
      expect(vets[0].specialization).toBe("Surgery");

      const softDeleted = await factory.vetDirectoryRepo.softDeleteVeterinarian(vetId, shelterId);
      expect(softDeleted).toBe(true);

      const activeVets = await factory.vetDirectoryRepo.listVeterinariansByClinic(clinicId, shelterId);
      expect(activeVets).toHaveLength(0);
    });
  });

  describe("Appointment Repository & Documents", () => {
    let shelterId: string;
    let petId: string;
    let clinicId: string;

    beforeEach(async () => {
      shelterId = generateUUIDv7();
      petId = generateUUIDv7();
      clinicId = generateUUIDv7();

      await factory.shelterRepo.create({
        id: shelterId,
        name: "Appointment Shelter",
        description: null,
        isActive: true,
      });

      await factory.petRepo.create({
        id: petId,
        shelterId,
        name: "Bailey",
        dob: "2021-01-01",
        isDobEstimated: false,
        species: "Dog",
        breed: "Golden",
        sex: "Male",
        color: "Gold",
        intakeOrigin: "STREET_RESCUE",
        intakeOriginDetail: null,
        healthConditions: null,
        healthStatus: "Healthy",
        availableForAdoption: true,
        outcomeStatus: null,
        outcomeDate: null,
        isArchived: false,
      });

      await factory.vetDirectoryRepo.createClinic({
        id: clinicId,
        shelterId,
        name: "Central Clinic",
        address: null,
        phone: null,
        email: null,
      });
    });

    it("should log, list, and soft-delete appointments", async () => {
      const apptId = generateUUIDv7();
      const appt = await factory.appointmentRepo.create({
        id: apptId,
        shelterId,
        petId,
        clinicId,
        veterinarianId: null,
        appointmentDate: "2023-10-15T10:00:00.000Z",
        isRetroactive: false,
        notes: "Annual checkup",
      });

      expect(appt.notes).toBe("Annual checkup");

      const list = await factory.appointmentRepo.listByPet(petId, shelterId);
      expect(list).toHaveLength(1);

      const found = await factory.appointmentRepo.findById(apptId, shelterId);
      expect(found).toEqual(appt);

      const deleted = await factory.appointmentRepo.softDelete(apptId, shelterId);
      expect(deleted).toBe(true);

      const listAfterDelete = await factory.appointmentRepo.listByPet(petId, shelterId);
      expect(listAfterDelete).toHaveLength(0);
    });

    it("should attach, list, and delete appointment documents", async () => {
      const apptId = generateUUIDv7();
      await factory.appointmentRepo.create({
        id: apptId,
        shelterId,
        petId,
        clinicId,
        veterinarianId: null,
        appointmentDate: "2023-10-15T10:00:00.000Z",
        isRetroactive: false,
        notes: "Checkup",
      });

      const docId = generateUUIDv7();
      const doc = await factory.appointmentRepo.addDocument({
        id: docId,
        shelterId,
        appointmentId: apptId,
        fileName: "bloodwork.pdf",
        filePath: "uploads/docs/bloodwork.pdf",
        mimeType: "application/pdf",
        fileSizeBytes: 204800,
      });

      expect(doc.fileName).toBe("bloodwork.pdf");

      const docs = await factory.appointmentRepo.getDocuments(apptId, shelterId);
      expect(docs).toHaveLength(1);

      const deleted = await factory.appointmentRepo.deleteDocument(docId, apptId, shelterId);
      expect(deleted).toBe(true);

      const remainingDocs = await factory.appointmentRepo.getDocuments(apptId, shelterId);
      expect(remainingDocs).toHaveLength(0);
    });
  });

  describe("Care Event Repository & Occurrences", () => {
    let shelterId: string;
    let petId: string;

    beforeEach(async () => {
      shelterId = generateUUIDv7();
      petId = generateUUIDv7();

      await factory.shelterRepo.create({
        id: shelterId,
        name: "Care Shelter",
        description: null,
        isActive: true,
      });

      await factory.petRepo.create({
        id: petId,
        shelterId,
        name: "Mochi",
        dob: "2022-01-01",
        isDobEstimated: false,
        species: "Cat",
        breed: "Siamese",
        sex: "Female",
        color: "Seal Point",
        intakeOrigin: "STREET_RESCUE",
        intakeOriginDetail: null,
        healthConditions: null,
        healthStatus: "In Treatment",
        availableForAdoption: false,
        outcomeStatus: null,
        outcomeDate: null,
        isArchived: false,
      });
    });

    it("should schedule care event, generate occurrences, and query due alerts", async () => {
      const eventId = generateUUIDv7();
      const event = await factory.careEventRepo.create({
        id: eventId,
        shelterId,
        petId,
        appointmentId: null,
        modality: "Medication",
        substance: "Amoxicillin",
        instructions: "Twice daily with food",
        isRecurring: true,
        recurrenceIntervalValue: 12,
        recurrenceIntervalUnit: "hours",
        isTemporary: true,
        startDate: "2023-11-01T08:00:00.000Z",
        endDate: "2023-11-07T08:00:00.000Z",
        status: "ACTIVE",
      });

      expect(event.id).toBe(eventId);

      const occ1Id = generateUUIDv7();
      const occ2Id = generateUUIDv7();

      await factory.careEventRepo.createOccurrences([
        {
          id: occ1Id,
          shelterId,
          careEventId: eventId,
          petId,
          dueDate: "2023-11-01T08:00:00.000Z",
          status: "PENDING",
          completedAt: null,
          notes: null,
        },
        {
          id: occ2Id,
          shelterId,
          careEventId: eventId,
          petId,
          dueDate: "2023-11-01T20:00:00.000Z",
          status: "PENDING",
          completedAt: null,
          notes: null,
        },
      ]);

      const occurrences = await factory.careEventRepo.listOccurrencesByPet(petId, shelterId);
      expect(occurrences).toHaveLength(2);

      // Query due occurrences before 12:00
      const due = await factory.careEventRepo.listDueOccurrences(
        shelterId,
        "2023-11-01T12:00:00.000Z"
      );
      expect(due).toHaveLength(1);
      expect(due[0].id).toBe(occ1Id);

      // Complete occ1
      const completed = await factory.careEventRepo.updateOccurrenceStatus(
        occ1Id,
        shelterId,
        "COMPLETED",
        "2023-11-01T08:15:00.000Z",
        "Administered with wet food"
      );
      expect(completed.status).toBe("COMPLETED");
      expect(completed.notes).toBe("Administered with wet food");

      // Cancel remaining future occurrences
      const cancelledCount = await factory.careEventRepo.cancelFutureOccurrences(
        eventId,
        shelterId
      );
      expect(cancelledCount).toBe(1);

      const remainingOccurrences = await factory.careEventRepo.listOccurrencesByPet(
        petId,
        shelterId
      );
      const pending = remainingOccurrences.filter((o) => o.status === "PENDING");
      expect(pending).toHaveLength(0);
    });

    it("should cancel all pet occurrences upon archival", async () => {
      const eventId = generateUUIDv7();
      await factory.careEventRepo.create({
        id: eventId,
        shelterId,
        petId,
        appointmentId: null,
        modality: "Vaccine",
        substance: "Rabies",
        instructions: null,
        isRecurring: false,
        recurrenceIntervalValue: null,
        recurrenceIntervalUnit: null,
        isTemporary: false,
        startDate: "2023-12-01T10:00:00.000Z",
        endDate: null,
        status: "ACTIVE",
      });

      await factory.careEventRepo.createOccurrences([
        {
          id: generateUUIDv7(),
          shelterId,
          careEventId: eventId,
          petId,
          dueDate: "2023-12-01T10:00:00.000Z",
          status: "PENDING",
          completedAt: null,
          notes: null,
        },
      ]);

      const cancelled = await factory.careEventRepo.cancelAllPetOccurrences(petId, shelterId);
      expect(cancelled).toBe(1);
    });
  });

  describe("Audit Log Repository", () => {
    it("should append and query audit logs", async () => {
      const shelterId = generateUUIDv7();
      const petId = generateUUIDv7();

      await factory.shelterRepo.create({
        id: shelterId,
        name: "Audit Test Shelter",
        description: null,
        isActive: true,
      });

      const log = await factory.auditLogRepo.append({
        shelterId,
        entityType: "PET",
        entityId: petId,
        action: "CREATE",
        actorType: "OPERATOR",
        actorId: "op-1",
        details: JSON.stringify({ name: "Luna" }),
      });

      expect(log.id).toBeDefined();
      expect(log.createdAt).toBeDefined();

      const shelterLogs = await factory.auditLogRepo.listByShelter(shelterId);
      expect(shelterLogs).toHaveLength(1);
      expect(shelterLogs[0].entityId).toBe(petId);

      const entityLogs = await factory.auditLogRepo.listByEntity("PET", petId);
      expect(entityLogs).toHaveLength(1);
      expect(entityLogs[0].action).toBe("CREATE");

      // Global audit log with null shelterId
      const globalLog = await factory.auditLogRepo.append({
        shelterId: null,
        entityType: "OPERATOR",
        entityId: "op-1",
        action: "UPDATE",
        actorType: "OPERATOR",
        actorId: "op-1",
        details: JSON.stringify({ name: "Helder" }),
      });
      expect(globalLog.shelterId).toBeNull();
    });
  });

  describe("ScopedRepositoryFactory", () => {
    it("should provide pre-bound shelter-scoped repositories", async () => {
      const shelterId = generateUUIDv7();
      await factory.shelterRepo.create({
        id: shelterId,
        name: "Scoped Shelter",
        description: null,
        isActive: true,
      });

      const scoped = factory.forShelter(shelterId);
      expect(scoped.shelterId).toBe(shelterId);

      const petId = generateUUIDv7();
      const pet = await scoped.petRepo.create({
        id: petId,
        name: "Coco",
        dob: "2023-01-01",
        isDobEstimated: false,
        species: "Cat",
        breed: "Domestic",
        sex: "Female",
        color: "Calico",
        intakeOrigin: "STREET_RESCUE",
        intakeOriginDetail: null,
        healthConditions: null,
        healthStatus: "Healthy",
        availableForAdoption: true,
        outcomeStatus: null,
        outcomeDate: null,
        isArchived: false,
      });

      expect(pet.shelterId).toBe(shelterId);

      const found = await scoped.petRepo.findById(petId);
      expect(found).toEqual(pet);

      const searchResults = await scoped.petRepo.search({ query: "coco" });
      expect(searchResults).toHaveLength(1);
    });
  });
});

