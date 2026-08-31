import { describe, it, expect, beforeEach } from "vitest";
import { createDatabase, type LunaDatabase } from "../../src/adapters/sqlite/database.js";
import { SqliteRepositoryFactory } from "../../src/adapters/sqlite/repositories/index.js";
import { ShelterAppFacadeImpl } from "../../packages/app-core/src/facade.js";

describe("E2E: Dashboard Live KPIs & Real-Time Operational Overview (US 51-52)", () => {
  let db: LunaDatabase;
  let factory: SqliteRepositoryFactory;
  let facade: ShelterAppFacadeImpl;

  beforeEach(() => {
    const initialized = createDatabase(":memory:");
    db = initialized.db;
    factory = new SqliteRepositoryFactory(db);
    facade = new ShelterAppFacadeImpl(factory);
  });

  it("calculates and updates all 5 KPIs in real time across different shelter contexts", async () => {
    const shelter1 = await facade.createShelter("East Branch");
    const shelter2 = await facade.createShelter("West Branch");

    // Shelter 1: 2 active pets (1 healthy, 1 in treatment)
    const pet1 = await facade.registerPet(shelter1.id, {
      name: "Coco",
      dateOfBirth: "2023-01-01",
      estimatedDOB: false,
      species: "Dog",
      intakeOrigin: "StreetRescue",
      healthConditions: [],
      healthStatus: "Healthy",
      status: "active",
      availableForAdoption: true,
    });

    const pet2 = await facade.registerPet(shelter1.id, {
      name: "Luna",
      dateOfBirth: "2022-05-15",
      estimatedDOB: false,
      species: "Cat",
      intakeOrigin: "OwnerSurrender",
      healthConditions: ["Wound"],
      healthStatus: "InTreatment",
      status: "active",
      availableForAdoption: false,
    });

    // Place pet1 in foster
    await facade.placeInFoster(pet1.id, shelter1.id);

    // Schedule due care event in Shelter 1
    await facade.createCareEvent(shelter1.id, {
      petId: pet2.id,
      modality: "Medication",
      substance: "Antibiotic",
      startDate: new Date(Date.now() - 3600 * 1000).toISOString(), // 1 hour ago (Due/Overdue)
    });

    // Verify Shelter 1 KPIs
    const kpis1 = await facade.getDashboardOverview(shelter1.id);
    expect(kpis1.totalActivePets).toBe(2);
    expect(kpis1.petsInTreatment).toBe(1);
    expect(kpis1.petsInFoster).toBe(1);
    expect(kpis1.dueCareEvents + kpis1.overdueCareEvents).toBeGreaterThanOrEqual(1);

    // Verify Shelter 2 KPIs are completely zero (strict shelter isolation)
    const kpis2 = await facade.getDashboardOverview(shelter2.id);
    expect(kpis2.totalActivePets).toBe(0);
    expect(kpis2.petsInTreatment).toBe(0);
    expect(kpis2.petsInFoster).toBe(0);
    expect(kpis2.dueCareEvents).toBe(0);
    expect(kpis2.overdueCareEvents).toBe(0);
  });
});
