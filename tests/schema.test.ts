import { describe, it, expect, beforeEach } from "vitest";
import { createDatabase, type LunaDatabase } from "../src/adapters/sqlite/database.js";
import * as schema from "../src/adapters/sqlite/schema.js";
import { generateUUIDv7 } from "../src/core/domain/uuid.js";
import type Database from "better-sqlite3";
import { eq } from "drizzle-orm";

describe("Phase 1 SQLite Schema & DDL Setup (Ticket T02)", () => {
  let rawDb: Database.Database;
  let db: LunaDatabase;

  beforeEach(() => {
    const initialized = createDatabase(":memory:");
    rawDb = initialized.rawDb;
    db = initialized.db;
  });

  describe("Table and Index Creation", () => {
    it("should initialize all 13 core tables without error", () => {
      const tables = rawDb
        .prepare(
          "SELECT name FROM sqlite_master WHERE type='table' AND name NOT LIKE 'sqlite_%' ORDER BY name;"
        )
        .all() as { name: string }[];

      const tableNames = tables.map((t) => t.name);

      expect(tableNames).toContain("operator_profile");
      expect(tableNames).toContain("shelters");
      expect(tableNames).toContain("pets");
      expect(tableNames).toContain("pet_media");
      expect(tableNames).toContain("adopter_details");
      expect(tableNames).toContain("shadow_records");
      expect(tableNames).toContain("vet_clinics");
      expect(tableNames).toContain("veterinarians");
      expect(tableNames).toContain("vet_appointments");
      expect(tableNames).toContain("vet_documents");
      expect(tableNames).toContain("care_events");
      expect(tableNames).toContain("care_event_occurrences");
      expect(tableNames).toContain("audit_logs");
    });

    it("should create all required B-tree indexes for fast sub-300ms queries", () => {
      const indexes = rawDb
        .prepare(
          "SELECT name FROM sqlite_master WHERE type='index' AND name NOT LIKE 'sqlite_%' ORDER BY name;"
        )
        .all() as { name: string }[];

      const indexNames = indexes.map((i) => i.name);

      expect(indexNames).toContain("idx_shelters_name");
      expect(indexNames).toContain("idx_pets_shelter_id");
      expect(indexNames).toContain("idx_pets_shelter_name");
      expect(indexNames).toContain("idx_pets_shelter_status");
      expect(indexNames).toContain("idx_pets_shelter_adoption");
      expect(indexNames).toContain("idx_pet_media_pet");
      expect(indexNames).toContain("idx_adopter_details_pet");
      expect(indexNames).toContain("idx_shadow_records_origin_shelter");
      expect(indexNames).toContain("idx_vet_clinics_shelter");
      expect(indexNames).toContain("idx_veterinarians_clinic");
      expect(indexNames).toContain("idx_vet_appointments_pet");
      expect(indexNames).toContain("idx_care_events_pet");
      expect(indexNames).toContain("idx_care_occurrences_due");
      expect(indexNames).toContain("idx_audit_logs_shelter");
    });
  });

  describe("UUIDv7 Generator", () => {
    it("should generate valid RFC 9562 UUIDv7 strings", () => {
      const uuid = generateUUIDv7();
      const uuidv7Regex =
        /^[0-9a-f]{8}-[0-9a-f]{4}-7[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
      expect(uuid).toMatch(uuidv7Regex);
    });

    it("should generate chronologically ordered UUIDs", async () => {
      const id1 = generateUUIDv7(1000);
      const id2 = generateUUIDv7(2000);
      const id3 = generateUUIDv7(3000);

      expect(id1 < id2).toBe(true);
      expect(id2 < id3).toBe(true);
    });
  });

  describe("Foreign Key Integrity & Cascades", () => {
    it("should reject orphan child records when parent does not exist", () => {
      const petId = generateUUIDv7();
      const nonExistentShelterId = generateUUIDv7();

      expect(() => {
        rawDb
          .prepare(
            `INSERT INTO pets (id, shelter_id, name, dob, species, breed, sex, color, intake_origin, health_status, created_at, updated_at)
             VALUES (?, ?, 'Luna', '2023-01-01', 'Feline', 'Domestic', 'Female', 'Black', 'STREET_RESCUE', 'Healthy', datetime('now'), datetime('now'))`
          )
          .run(petId, nonExistentShelterId);
      }).toThrow(/FOREIGN KEY constraint failed/);
    });

    it("should cascade delete pets when a shelter is deleted", async () => {
      const shelterId = generateUUIDv7();
      const petId = generateUUIDv7();
      const now = new Date().toISOString();

      await db.insert(schema.sheltersTable).values({
        id: shelterId,
        name: "Downtown Shelter",
        description: "Main Facility",
        isActive: true,
        createdAt: now,
        updatedAt: now,
      });

      await db.insert(schema.petsTable).values({
        id: petId,
        shelterId: shelterId,
        name: "Luna",
        dob: "2023-01-01",
        isDobEstimated: false,
        species: "Feline",
        breed: "Domestic Shorthair",
        sex: "Female",
        color: "Black",
        intakeOrigin: "STREET_RESCUE",
        healthStatus: "Healthy",
        availableForAdoption: true,
        isArchived: false,
        createdAt: now,
        updatedAt: now,
      });

      const beforeDelete = await db
        .select()
        .from(schema.petsTable)
        .where(eq(schema.petsTable.id, petId));
      expect(beforeDelete).toHaveLength(1);

      // Delete shelter
      await db
        .delete(schema.sheltersTable)
        .where(eq(schema.sheltersTable.id, shelterId));

      const afterDelete = await db
        .select()
        .from(schema.petsTable)
        .where(eq(schema.petsTable.id, petId));
      expect(afterDelete).toHaveLength(0);
    });

    it("should cascade delete care events and occurrences when a pet is deleted", async () => {
      const shelterId = generateUUIDv7();
      const petId = generateUUIDv7();
      const careEventId = generateUUIDv7();
      const occurrenceId = generateUUIDv7();
      const now = new Date().toISOString();

      await db.insert(schema.sheltersTable).values({
        id: shelterId,
        name: "North Branch",
        isActive: true,
        createdAt: now,
        updatedAt: now,
      });

      await db.insert(schema.petsTable).values({
        id: petId,
        shelterId: shelterId,
        name: "Milo",
        dob: "2022-05-10",
        species: "Canine",
        breed: "Labrador",
        sex: "Male",
        color: "Golden",
        intakeOrigin: "OWNER_SURRENDER",
        healthStatus: "Healthy",
        createdAt: now,
        updatedAt: now,
      });

      await db.insert(schema.careEventsTable).values({
        id: careEventId,
        shelterId: shelterId,
        petId: petId,
        modality: "Vaccine",
        substance: "Rabies",
        isRecurring: false,
        isTemporary: false,
        startDate: now,
        status: "ACTIVE",
        createdAt: now,
        updatedAt: now,
      });

      await db.insert(schema.careEventOccurrencesTable).values({
        id: occurrenceId,
        shelterId: shelterId,
        careEventId: careEventId,
        petId: petId,
        dueDate: now,
        status: "PENDING",
        createdAt: now,
        updatedAt: now,
      });

      // Delete pet
      await db.delete(schema.petsTable).where(eq(schema.petsTable.id, petId));

      const events = await db
        .select()
        .from(schema.careEventsTable)
        .where(eq(schema.careEventsTable.id, careEventId));
      expect(events).toHaveLength(0);

      const occurrences = await db
        .select()
        .from(schema.careEventOccurrencesTable)
        .where(eq(schema.careEventOccurrencesTable.id, occurrenceId));
      expect(occurrences).toHaveLength(0);
    });

    it("should restrict deletion of a veterinary clinic referenced by an appointment", async () => {
      const shelterId = generateUUIDv7();
      const petId = generateUUIDv7();
      const clinicId = generateUUIDv7();
      const appointmentId = generateUUIDv7();
      const now = new Date().toISOString();

      await db.insert(schema.sheltersTable).values({
        id: shelterId,
        name: "East Shelter",
        isActive: true,
        createdAt: now,
        updatedAt: now,
      });

      await db.insert(schema.petsTable).values({
        id: petId,
        shelterId: shelterId,
        name: "Bella",
        dob: "2021-03-15",
        species: "Canine",
        breed: "Beagle",
        sex: "Female",
        color: "Tricolor",
        intakeOrigin: "STREET_RESCUE",
        healthStatus: "Healthy",
        createdAt: now,
        updatedAt: now,
      });

      await db.insert(schema.vetClinicsTable).values({
        id: clinicId,
        shelterId: shelterId,
        name: "Downtown Vet Clinic",
        createdAt: now,
        updatedAt: now,
      });

      await db.insert(schema.vetAppointmentsTable).values({
        id: appointmentId,
        shelterId: shelterId,
        petId: petId,
        clinicId: clinicId,
        appointmentDate: now,
        notes: "Routine health checkup",
        createdAt: now,
        updatedAt: now,
      });

      // Attempting to delete clinic should throw RESTRICT error
      expect(() => {
        rawDb
          .prepare("DELETE FROM vet_clinics WHERE id = ?")
          .run(clinicId);
      }).toThrow(/FOREIGN KEY constraint failed/);
    });

    it("should set veterinarian_id to null when veterinarian is deleted from an appointment", async () => {
      const shelterId = generateUUIDv7();
      const petId = generateUUIDv7();
      const clinicId = generateUUIDv7();
      const vetId = generateUUIDv7();
      const appointmentId = generateUUIDv7();
      const now = new Date().toISOString();

      await db.insert(schema.sheltersTable).values({
        id: shelterId,
        name: "South Shelter",
        isActive: true,
        createdAt: now,
        updatedAt: now,
      });

      await db.insert(schema.petsTable).values({
        id: petId,
        shelterId: shelterId,
        name: "Oliver",
        dob: "2020-08-01",
        species: "Feline",
        breed: "Tabby",
        sex: "Male",
        color: "Striped",
        intakeOrigin: "BORN_AT_SHELTER",
        healthStatus: "Healthy",
        createdAt: now,
        updatedAt: now,
      });

      await db.insert(schema.vetClinicsTable).values({
        id: clinicId,
        shelterId: shelterId,
        name: "Pet Care Hospital",
        createdAt: now,
        updatedAt: now,
      });

      await db.insert(schema.veterinariansTable).values({
        id: vetId,
        shelterId: shelterId,
        clinicId: clinicId,
        name: "Dr. Smith",
        createdAt: now,
        updatedAt: now,
      });

      await db.insert(schema.vetAppointmentsTable).values({
        id: appointmentId,
        shelterId: shelterId,
        petId: petId,
        clinicId: clinicId,
        veterinarianId: vetId,
        appointmentDate: now,
        notes: "Vaccination consult",
        createdAt: now,
        updatedAt: now,
      });

      // Delete veterinarian
      await db
        .delete(schema.veterinariansTable)
        .where(eq(schema.veterinariansTable.id, vetId));

      const appointments = await db
        .select()
        .from(schema.vetAppointmentsTable)
        .where(eq(schema.vetAppointmentsTable.id, appointmentId));

      expect(appointments).toHaveLength(1);
      expect(appointments[0].veterinarianId).toBeNull();
    });
  });

  describe("CRUD with Full Schema Fields", () => {
    it("should insert and retrieve operator profile and audit logs", async () => {
      const operatorId = generateUUIDv7();
      const auditId = generateUUIDv7();
      const now = new Date().toISOString();

      await db.insert(schema.operatorProfileTable).values({
        id: operatorId,
        name: "Helder Souza",
        email: "hellder.souza@proton.me",
        createdAt: now,
        updatedAt: now,
      });

      await db.insert(schema.auditLogsTable).values({
        id: auditId,
        shelterId: null,
        entityType: "OPERATOR",
        entityId: operatorId,
        action: "CREATE",
        actorType: "OPERATOR",
        actorId: operatorId,
        details: JSON.stringify({ name: "Helder Souza" }),
        createdAt: now,
      });

      const operator = await db
        .select()
        .from(schema.operatorProfileTable)
        .where(eq(schema.operatorProfileTable.id, operatorId));
      expect(operator).toHaveLength(1);
      expect(operator[0].name).toBe("Helder Souza");

      const logs = await db
        .select()
        .from(schema.auditLogsTable)
        .where(eq(schema.auditLogsTable.id, auditId));
      expect(logs).toHaveLength(1);
      expect(logs[0].action).toBe("CREATE");
    });
  });
});
