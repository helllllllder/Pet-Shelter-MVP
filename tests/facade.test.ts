import { describe, it, expect, beforeEach } from "vitest";
import { createDatabase, type LunaDatabase } from "../src/adapters/sqlite/database.js";
import { SqliteRepositoryFactory } from "../src/adapters/sqlite/repositories/index.js";
import { ShelterAppFacadeImpl } from "../packages/app-core/src/facade.js";
import type { ShelterAppFacade } from "../packages/contracts/src/index.js";

describe("Application Facade — ShelterAppFacade Core (Ticket T05 / #28)", () => {
  let db: LunaDatabase;
  let factory: SqliteRepositoryFactory;
  let facade: ShelterAppFacade;

  beforeEach(() => {
    const initialized = createDatabase(":memory:");
    db = initialized.db;
    factory = new SqliteRepositoryFactory(db);
    facade = new ShelterAppFacadeImpl(factory);
  });

  describe("1. Operator Profile Management (US 1-4)", () => {
    it("should register, retrieve, and update operator profile", async () => {
      const registered = await facade.registerOperator("Helder Souza", "helder@example.com");
      expect(registered.name).toBe("Helder Souza");
      expect(registered.email).toBe("helder@example.com");

      const profile = await facade.getOperatorProfile();
      expect(profile).toEqual(registered);

      const updated = await facade.updateOperatorProfile("Helder S.", "helder.new@example.com");
      expect(updated.name).toBe("Helder S.");
      expect(updated.email).toBe("helder.new@example.com");
    });
  });

  describe("2. Shelter Management (US 5-8)", () => {
    it("should create, list, retrieve, and update shelters", async () => {
      const shelter1 = await facade.createShelter("Sunny Meadows Shelter", "Main Shelter");
      expect(shelter1.name).toBe("Sunny Meadows Shelter");
      expect(shelter1.description).toBe("Main Shelter");

      const shelter2 = await facade.createShelter("Riverdale Shelter", "East Shelter");
      expect(shelter2.name).toBe("Riverdale Shelter");

      const list = await facade.listShelters();
      expect(list).toHaveLength(2);

      const retrieved = await facade.getShelter(shelter1.id);
      expect(retrieved?.name).toBe("Sunny Meadows Shelter");

      const updated = await facade.updateShelter(shelter1.id, "Sunny Meadows Main", "Updated Desc");
      expect(updated.name).toBe("Sunny Meadows Main");
      expect(updated.description).toBe("Updated Desc");
    });
  });

  describe("3. Pet Management & Scoped Queries (US 11-24)", () => {
    let shelterId: string;
    let shelterBId: string;

    beforeEach(async () => {
      const s1 = await facade.createShelter("Shelter A");
      const s2 = await facade.createShelter("Shelter B");
      shelterId = s1.id;
      shelterBId = s2.id;
    });

    it("should register pet, retrieve profile, and enforce shelter scoping", async () => {
      const pet = await facade.registerPet(shelterId, {
        name: "Milo",
        dateOfBirth: "2023-01-01",
        estimatedDOB: false,
        species: "Cat",
        breed: "Tabby",
        sex: "Male",
        color: "Orange",
        intakeOrigin: "StreetRescue",
        healthConditions: ["FIV-"],
        healthStatus: "Healthy",
        status: "active",
        availableForAdoption: true,
      });

      expect(pet.id).toBeDefined();
      expect(pet.name).toBe("Milo");

      const foundInA = await facade.getPet(pet.id, shelterId);
      expect(foundInA?.name).toBe("Milo");

      // Isolation: lookup in Shelter B returns null
      const foundInB = await facade.getPet(pet.id, shelterBId);
      expect(foundInB).toBeNull();
    });

    it("should list and search pets with filters", async () => {
      await facade.registerPet(shelterId, {
        name: "Max",
        dateOfBirth: "2021-01-01",
        estimatedDOB: false,
        species: "Dog",
        breed: "Golden",
        sex: "Male",
        color: "Gold",
        intakeOrigin: "StreetRescue",
        healthConditions: [],
        healthStatus: "Healthy",
        status: "active",
        availableForAdoption: true,
      });

      await facade.registerPet(shelterId, {
        name: "Bella",
        dateOfBirth: "2022-02-02",
        estimatedDOB: false,
        species: "Dog",
        breed: "Labrador",
        sex: "Female",
        color: "Black",
        intakeOrigin: "OwnerSurrender",
        healthConditions: [],
        healthStatus: "InTreatment",
        status: "active",
        availableForAdoption: false,
      });

      const all = await facade.listPets(shelterId);
      expect(all).toHaveLength(2);

      const searched = await facade.listPets(shelterId, { search: "max" });
      expect(searched).toHaveLength(1);
      expect(searched[0].name).toBe("Max");

      const available = await facade.listPets(shelterId, { availableForAdoption: true });
      expect(available).toHaveLength(1);
      expect(available[0].name).toBe("Max");
    });

    it("should update pet and delete non-archived pet", async () => {
      const pet = await facade.registerPet(shelterId, {
        name: "Ghost",
        dateOfBirth: "2022-01-01",
        estimatedDOB: false,
        species: "Dog",
        intakeOrigin: "StreetRescue",
        healthConditions: [],
        healthStatus: "Healthy",
        status: "active",
        availableForAdoption: false,
      });

      const updated = await facade.updatePet(pet.id, shelterId, {
        name: "Ghost Rider",
        availableForAdoption: true,
      });
      expect(updated.name).toBe("Ghost Rider");
      expect(updated.availableForAdoption).toBe(true);

      await facade.hardDeletePet(pet.id, shelterId);
      const deleted = await facade.getPet(pet.id, shelterId);
      expect(deleted).toBeNull();
    });
  });

  describe("4. Pet Lifecycle Transitions (US 25-32)", () => {
    let shelterId: string;
    let petId: string;

    beforeEach(async () => {
      const shelter = await facade.createShelter("Lifecycle Shelter");
      shelterId = shelter.id;

      const pet = await facade.registerPet(shelterId, {
        name: "Cooper",
        dateOfBirth: "2020-05-01",
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

    it("should transition outcome through facade", async () => {
      const adopted = await facade.transitionPetOutcome(petId, shelterId, "adopted");
      expect(adopted.status).toBe("archived");
      expect(adopted.outcome).toBe("adopted");
      expect(adopted.availableForAdoption).toBe(false);
    });
  });

  describe("5. Veterinary Directory & Appointments (US 33-43)", () => {
    let shelterId: string;
    let petId: string;

    beforeEach(async () => {
      const shelter = await facade.createShelter("Vet Shelter");
      shelterId = shelter.id;

      const pet = await facade.registerPet(shelterId, {
        name: "Buster",
        dateOfBirth: "2021-01-01",
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

    it("should manage veterinary clinics, veterinarians, and appointments", async () => {
      const clinic = await facade.createClinic(shelterId, {
        name: "Downtown Vet Care",
        address: "100 Main St",
        phone: "555-1111",
      });
      expect(clinic.name).toBe("Downtown Vet Care");

      const clinics = await facade.listClinics(shelterId);
      expect(clinics).toHaveLength(1);

      const vet = await facade.createVet(shelterId, {
        clinicId: clinic.id,
        name: "Dr. Emily Smith",
        specialization: "Surgery",
      });
      expect(vet.name).toBe("Dr. Emily Smith");

      const vets = await facade.listVets(shelterId, clinic.id);
      expect(vets).toHaveLength(1);

      const appt = await facade.createAppointment(shelterId, {
        petId,
        clinicId: clinic.id,
        veterinarianId: vet.id,
        scheduledAt: "2024-06-01T10:00:00.000Z",
        notes: "Routine vaccination",
      });
      expect(appt.petId).toBe(petId);

      const appts = await facade.listAppointments(petId, shelterId);
      expect(appts).toHaveLength(1);
    });
  });

  describe("6. Care Events & Treatment Scheduling (US 44-50)", () => {
    let shelterId: string;
    let petId: string;

    beforeEach(async () => {
      const shelter = await facade.createShelter("Care Shelter");
      shelterId = shelter.id;

      const pet = await facade.registerPet(shelterId, {
        name: "Whiskers",
        dateOfBirth: "2022-01-01",
        estimatedDOB: false,
        species: "Cat",
        intakeOrigin: "StreetRescue",
        healthConditions: [],
        healthStatus: "Healthy",
        status: "active",
        availableForAdoption: true,
      });
      petId = pet.id;
    });

    it("should schedule care events and list by pet", async () => {
      const event = await facade.createCareEvent(shelterId, {
        petId,
        modality: "Vaccine",
        substance: "Rabies",
        instructions: "Administer subcutaneously",
        recurrenceRule: {
          interval: 1,
          unit: "years",
        },
      });

      expect(event.petId).toBe(petId);
      expect(event.modality).toBe("Vaccine");

      const events = await facade.listCareEvents(petId, shelterId);
      expect(events).toHaveLength(1);
    });
  });

  describe("7. Dashboard Overview KPIs (US 51-52)", () => {
    it("should return live operational overview counters", async () => {
      const shelter = await facade.createShelter("Dashboard Shelter");
      const sid = shelter.id;

      await facade.registerPet(sid, {
        name: "Active Dog 1",
        dateOfBirth: "2021-01-01",
        estimatedDOB: false,
        species: "Dog",
        intakeOrigin: "StreetRescue",
        healthConditions: [],
        healthStatus: "Healthy",
        status: "active",
        availableForAdoption: true,
      });

      await facade.registerPet(sid, {
        name: "Treatment Dog 2",
        dateOfBirth: "2021-01-01",
        estimatedDOB: false,
        species: "Dog",
        intakeOrigin: "StreetRescue",
        healthConditions: [],
        healthStatus: "InTreatment",
        status: "active",
        availableForAdoption: false,
      });

      const overview = await facade.getDashboardOverview(sid);
      expect(overview.totalActivePets).toBe(2);
      expect(overview.petsInTreatment).toBe(1);
      expect(overview.petsInFoster).toBe(0);
      expect(overview.dueCareEvents).toBe(0);
    });
  });
});
