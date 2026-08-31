import { describe, it, expect, beforeEach } from "vitest";
import { createDatabase, type LunaDatabase } from "../../src/adapters/sqlite/database.js";
import { SqliteRepositoryFactory } from "../../src/adapters/sqlite/repositories/index.js";
import { ShelterAppFacadeImpl } from "../../packages/app-core/src/facade.js";
import { useShelterStore } from "../../packages/ui-mobile/src/stores/shelter-store.js";
import { useOperatorStore } from "../../packages/ui-mobile/src/stores/operator-store.js";

describe("E2E: Operator Onboarding & Shelter Isolation (US 1-10)", () => {
  let db: LunaDatabase;
  let factory: SqliteRepositoryFactory;
  let facade: ShelterAppFacadeImpl;

  beforeEach(() => {
    const initialized = createDatabase(":memory:");
    db = initialized.db;
    factory = new SqliteRepositoryFactory(db);
    facade = new ShelterAppFacadeImpl(factory);

    // Reset Zustand stores
    useShelterStore.setState({ shelters: [], activeShelterId: null });
    useOperatorStore.setState({ profile: null });
  });

  it("completes full operator onboarding and profile updates", async () => {
    // 1. Initial launch: no profile
    const initialProfile = await facade.getOperatorProfile();
    expect(initialProfile).toBeNull();

    // 2. Register operator
    const profile = await facade.registerOperator("Jane Doe", "jane@shelter.org");
    expect(profile.id).toBeDefined();
    expect(profile.name).toBe("Jane Doe");
    expect(profile.email).toBe("jane@shelter.org");

    // Sync store
    useOperatorStore.setState({ profile });
    expect(useOperatorStore.getState().profile?.name).toBe("Jane Doe");

    // 3. Update operator details
    const updated = await facade.updateOperatorProfile("Jane Smith", "jane.smith@shelter.org");
    expect(updated.name).toBe("Jane Smith");
    expect(updated.email).toBe("jane.smith@shelter.org");
  });

  it("supports creating multiple shelters with duplicate names and switching active context", async () => {
    // 1. Create first shelter
    const shelterNorth = await facade.createShelter("Happy Paws", "North Facility");
    expect(shelterNorth.id).toBeDefined();
    expect(shelterNorth.name).toBe("Happy Paws");

    // 2. Create second shelter with the same name (allowed by US 7)
    const shelterSouth = await facade.createShelter("Happy Paws", "South Facility");
    expect(shelterSouth.id).toBeDefined();
    expect(shelterSouth.id).not.toBe(shelterNorth.id);

    // 3. Update shelter store and verify switching
    useShelterStore.getState().addShelter(shelterNorth);
    useShelterStore.getState().addShelter(shelterSouth);

    useShelterStore.getState().setActiveShelter(shelterNorth.id);
    expect(useShelterStore.getState().getActiveShelter()?.id).toBe(shelterNorth.id);

    useShelterStore.getState().setActiveShelter(shelterSouth.id);
    expect(useShelterStore.getState().getActiveShelter()?.id).toBe(shelterSouth.id);
  });

  it("enforces strict data isolation between shelters across all entities", async () => {
    const shelterA = await facade.createShelter("Downtown Sanctuary");
    const shelterB = await facade.createShelter("Uptown Rescue");

    // Register pet in Shelter A
    const petA = await facade.registerPet(shelterA.id, {
      name: "Max",
      dateOfBirth: "2023-01-01",
      estimatedDOB: false,
      species: "Dog",
      intakeOrigin: "StreetRescue",
      healthConditions: [],
      healthStatus: "Healthy",
      status: "active",
      availableForAdoption: true,
    });

    // Register clinic in Shelter A
    const clinicA = await facade.createClinic(shelterA.id, {
      name: "Downtown Vet Clinic",
    });

    // Verify Shelter A has records
    const petsInA = await facade.listPets(shelterA.id);
    const clinicsInA = await facade.listClinics(shelterA.id);
    expect(petsInA).toHaveLength(1);
    expect(petsInA[0].id).toBe(petA.id);
    expect(clinicsInA).toHaveLength(1);
    expect(clinicsInA[0].id).toBe(clinicA.id);

    // Verify Shelter B has zero records (strict multi-tenant isolation)
    const petsInB = await facade.listPets(shelterB.id);
    const clinicsInB = await facade.listClinics(shelterB.id);
    expect(petsInB).toHaveLength(0);
    expect(clinicsInB).toHaveLength(0);

    const crossQueryPet = await facade.getPet(petA.id, shelterB.id);
    expect(crossQueryPet).toBeNull();

    const crossQueryClinic = await facade.getClinic(shelterB.id, clinicA.id);
    expect(crossQueryClinic).toBeNull();
  });
});
