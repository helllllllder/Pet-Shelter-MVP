import { describe, it, expect, beforeEach } from "vitest";
import { createDatabase, type LunaDatabase } from "../../src/adapters/sqlite/database.js";
import { SqliteRepositoryFactory } from "../../src/adapters/sqlite/repositories/index.js";
import { ShelterAppFacadeImpl } from "../../packages/app-core/src/facade.js";

describe("E2E: Pet Registration & Demographics Lifecycle (US 11-32)", () => {
  let db: LunaDatabase;
  let factory: SqliteRepositoryFactory;
  let facade: ShelterAppFacadeImpl;
  let shelterId: string;

  beforeEach(async () => {
    const initialized = createDatabase(":memory:");
    db = initialized.db;
    factory = new SqliteRepositoryFactory(db);
    facade = new ShelterAppFacadeImpl(factory);

    const shelter = await facade.createShelter("Primary Adoption Center");
    shelterId = shelter.id;
  });

  it("handles full registration, estimated DOB, and search filtering", async () => {
    const dog = await facade.registerPet(shelterId, {
      name: "Bella",
      dateOfBirth: "2022-04-15",
      estimatedDOB: true,
      species: "Dog",
      breed: "Golden Retriever Mix",
      sex: "Female",
      color: "Golden",
      intakeOrigin: "OwnerSurrender",
      healthConditions: ["Allergies"],
      healthStatus: "Healthy",
      status: "active",
      availableForAdoption: true,
    });

    expect(dog.id).toBeDefined();
    expect(dog.estimatedDOB).toBe(true);
    expect(dog.availableForAdoption).toBe(true);

    const cat = await facade.registerPet(shelterId, {
      name: "Milo",
      dateOfBirth: "2023-08-01",
      estimatedDOB: false,
      species: "Cat",
      breed: "Domestic Shorthair",
      sex: "Male",
      color: "Tabby",
      intakeOrigin: "StreetRescue",
      healthConditions: ["FIV_Positive"],
      healthStatus: "InTreatment",
      status: "active",
      availableForAdoption: false,
    });

    // Search case-insensitive
    const searchResults = await facade.listPets(shelterId, { search: "bel" });
    expect(searchResults).toHaveLength(1);
    expect(searchResults[0].name).toBe("Bella");

    // Filter by species and adoption status
    const adoptableDogs = await facade.listPets(shelterId, {
      species: "Dog",
      availableForAdoption: true,
    });
    expect(adoptableDogs).toHaveLength(1);
    expect(adoptableDogs[0].name).toBe("Bella");
  });

  it("manages foster placement, foster return, and legal adoption with adopter details", async () => {
    const pet = await facade.registerPet(shelterId, {
      name: "Rocky",
      dateOfBirth: "2021-05-10",
      estimatedDOB: false,
      species: "Dog",
      intakeOrigin: "TransferFromAnotherShelter",
      healthConditions: [],
      healthStatus: "Healthy",
      status: "active",
      availableForAdoption: true,
    });

    // 1. Place in foster
    const inFoster = await facade.placeInFoster(pet.id, shelterId);
    expect(inFoster.status).toBe("in_foster");

    // 2. Return from foster
    const returned = await facade.returnFromFoster(pet.id, shelterId);
    expect(returned.status).toBe("active");

    // 3. Schedule care event
    await facade.createCareEvent(shelterId, {
      petId: pet.id,
      modality: "Vaccine",
      substance: "Rabies Booster",
      startDate: "2025-06-01T09:00:00.000Z",
    });

    const pendingCare = await facade.listCareOccurrences?.(pet.id, shelterId);
    expect(pendingCare).toHaveLength(1);

    // 4. Adopt pet with legal adopter details
    const adopted = await facade.transitionPetOutcome(
      pet.id,
      shelterId,
      "adopted",
      {
        name: "Alice Walker",
        phone: "555-1234",
        address: "742 Evergreen Terrace",
      }
    );

    expect(adopted.outcome).toBe("adopted");
    expect(adopted.status).toBe("archived");
    expect(adopted.availableForAdoption).toBe(false);

    // 5. Verify care events were automatically cancelled upon archival (US 31)
    const careAfterAdoption = await facade.listCareOccurrences?.(pet.id, shelterId);
    expect(careAfterAdoption?.[0].status).toBe("Cancelled");

    // 6. Prohibit hard deletion for archived pet (US 19)
    await expect(facade.hardDeletePet(pet.id, shelterId)).rejects.toThrow();
  });
});
