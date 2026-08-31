import { describe, it, expect, beforeEach } from "vitest";
import { createDatabase, type LunaDatabase } from "../src/adapters/sqlite/database.js";
import { SqliteRepositoryFactory } from "../src/adapters/sqlite/repositories/index.js";
import { DashboardService } from "../packages/app-core/src/dashboard-service.js";
import { ShelterAppFacadeImpl } from "../packages/app-core/src/facade.js";
import { generateUUIDv7 } from "../src/core/domain/uuid.js";

describe("Dashboard KPIs & Operational Overview (Ticket T11 / #29 / US 51-52)", () => {
  let db: LunaDatabase;
  let factory: SqliteRepositoryFactory;
  let dashboardService: DashboardService;
  let facade: ShelterAppFacadeImpl;

  beforeEach(() => {
    const initialized = createDatabase(":memory:");
    db = initialized.db;
    factory = new SqliteRepositoryFactory(db);
    dashboardService = new DashboardService(factory.petRepo, factory.careEventRepo);
    facade = new ShelterAppFacadeImpl(factory);
  });

  it("should return all 0s for a newly created empty shelter", async () => {
    const shelter = await facade.createShelter("Empty Shelter");
    const overview = await dashboardService.getOverview(shelter.id);

    expect(overview.totalActivePets).toBe(0);
    expect(overview.petsInTreatment).toBe(0);
    expect(overview.petsInFoster).toBe(0);
    expect(overview.dueCareEvents).toBe(0);
    expect(overview.overdueCareEvents).toBe(0);
  });

  it("should calculate active pets, pets in treatment, and pets in foster accurately", async () => {
    const shelter = await facade.createShelter("Active Shelter");
    const sid = shelter.id;

    // Healthy active pet
    const p1 = await facade.registerPet(sid, {
      name: "Dog 1",
      dateOfBirth: "2022-01-01",
      estimatedDOB: false,
      species: "Dog",
      intakeOrigin: "StreetRescue",
      healthConditions: [],
      healthStatus: "Healthy",
      status: "active",
      availableForAdoption: true,
    });

    // In treatment active pet
    const p2 = await facade.registerPet(sid, {
      name: "Dog 2",
      dateOfBirth: "2022-02-01",
      estimatedDOB: false,
      species: "Dog",
      intakeOrigin: "StreetRescue",
      healthConditions: ["Wound"],
      healthStatus: "InTreatment",
      status: "active",
      availableForAdoption: false,
    });

    // In foster active pet
    const p3 = await facade.registerPet(sid, {
      name: "Cat 1",
      dateOfBirth: "2023-01-01",
      estimatedDOB: false,
      species: "Cat",
      intakeOrigin: "BornAtShelter",
      healthConditions: [],
      healthStatus: "Healthy",
      status: "active",
      availableForAdoption: true,
    });
    await facade.placeInFoster?.(p3.id, sid);

    const overview = await dashboardService.getOverview(sid);
    expect(overview.totalActivePets).toBe(3);
    expect(overview.petsInTreatment).toBe(1);
    expect(overview.petsInFoster).toBe(1);
  });

  it("should enforce strict shelter isolation for KPI metrics", async () => {
    const shelterA = await facade.createShelter("Shelter A");
    const shelterB = await facade.createShelter("Shelter B");

    await facade.registerPet(shelterA.id, {
      name: "Dog A1",
      dateOfBirth: "2022-01-01",
      estimatedDOB: false,
      species: "Dog",
      intakeOrigin: "StreetRescue",
      healthConditions: [],
      healthStatus: "Healthy",
      status: "active",
      availableForAdoption: true,
    });

    const overviewA = await dashboardService.getOverview(shelterA.id);
    const overviewB = await dashboardService.getOverview(shelterB.id);

    expect(overviewA.totalActivePets).toBe(1);
    expect(overviewB.totalActivePets).toBe(0);
  });

  it("should instantly recalculate metrics when pets transition to archived outcomes", async () => {
    const shelter = await facade.createShelter("Recalculate Shelter");
    const sid = shelter.id;

    const pet = await facade.registerPet(sid, {
      name: "Available Pet",
      dateOfBirth: "2021-01-01",
      estimatedDOB: false,
      species: "Dog",
      intakeOrigin: "StreetRescue",
      healthConditions: [],
      healthStatus: "Healthy",
      status: "active",
      availableForAdoption: true,
    });

    let overview = await facade.getDashboardOverview(sid);
    expect(overview.totalActivePets).toBe(1);

    // Adopt pet -> archives record
    await facade.transitionPetOutcome(pet.id, sid, "adopted", {
      name: "Jane Doe",
      phone: "555-1234",
      address: "100 Maple St",
    });

    overview = await facade.getDashboardOverview(sid);
    expect(overview.totalActivePets).toBe(0);
  });

  it("should calculate due and overdue care occurrences accurately", async () => {
    const shelter = await facade.createShelter("Care KPI Shelter");
    const sid = shelter.id;

    const pet = await facade.registerPet(sid, {
      name: "Charlie",
      dateOfBirth: "2020-01-01",
      estimatedDOB: false,
      species: "Dog",
      intakeOrigin: "StreetRescue",
      healthConditions: [],
      healthStatus: "Healthy",
      status: "active",
      availableForAdoption: true,
    });

    const careEvent = await factory.careEventRepo.create({
      id: generateUUIDv7(),
      shelterId: sid,
      petId: pet.id,
      appointmentId: null,
      modality: "Vaccine",
      substance: "Rabies",
      instructions: null,
      isRecurring: false,
      recurrenceIntervalValue: null,
      recurrenceIntervalUnit: null,
      isTemporary: false,
      startDate: "2024-01-01T00:00:00.000Z",
      endDate: null,
      status: "ACTIVE",
    });

    // Add a past due occurrence (overdue)
    const yesterday = new Date(Date.now() - 48 * 60 * 60 * 1000).toISOString();
    await factory.careEventRepo.createOccurrences([
      {
        id: generateUUIDv7(),
        shelterId: sid,
        careEventId: careEvent.id,
        petId: pet.id,
        dueDate: yesterday,
        status: "PENDING",
        completedAt: null,
        notes: null,
      },
    ]);

    const overview = await dashboardService.getOverview(sid);
    expect(overview.dueCareEvents).toBe(1);
    expect(overview.overdueCareEvents).toBe(1);
  });
});
