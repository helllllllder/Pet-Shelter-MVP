import { describe, it, expect, beforeEach } from "vitest";
import { createDatabase, type LunaDatabase } from "../../src/adapters/sqlite/database.js";
import { SqliteRepositoryFactory } from "../../src/adapters/sqlite/repositories/index.js";
import { ShelterAppFacadeImpl } from "../../packages/app-core/src/facade.js";
import { useShelterStore } from "../../packages/ui-mobile/src/stores/shelter-store.js";
import { useOperatorStore } from "../../packages/ui-mobile/src/stores/operator-store.js";

describe("E2E: Comprehensive Full User Flow (End-to-End Operational Lifecycle)", () => {
  let db: LunaDatabase;
  let factory: SqliteRepositoryFactory;
  let facade: ShelterAppFacadeImpl;

  beforeEach(() => {
    const initialized = createDatabase(":memory:");
    db = initialized.db;
    factory = new SqliteRepositoryFactory(db);
    facade = new ShelterAppFacadeImpl(factory);

    useShelterStore.setState({ shelters: [], activeShelterId: null });
    useOperatorStore.setState({ profile: null });
  });

  it("executes the complete shelter operational workflow end-to-end", async () => {
    // 1. Operator Onboarding
    const operator = await facade.registerOperator("Alex Johnson", "alex@lunashelter.org");
    useOperatorStore.setState({ profile: operator });
    expect(useOperatorStore.getState().profile?.name).toBe("Alex Johnson");

    // 2. Shelter Creation
    const shelter = await facade.createShelter("Luna Sanctuary", "Main Campus");
    useShelterStore.getState().addShelter(shelter);
    useShelterStore.getState().setActiveShelter(shelter.id);
    const activeShelterId = useShelterStore.getState().activeShelterId!;
    expect(activeShelterId).toBe(shelter.id);

    // 3. Pet Intake Registration
    const pet = await facade.registerPet(activeShelterId, {
      name: "Buster",
      dateOfBirth: "2022-09-01",
      estimatedDOB: true,
      species: "Dog",
      breed: "Beagle Mix",
      sex: "Male",
      color: "Tricolor",
      intakeOrigin: "StreetRescue",
      healthConditions: ["EarMites"],
      healthStatus: "InTreatment",
      status: "active",
      availableForAdoption: true,
    });
    expect(pet.id).toBeDefined();

    // 4. Partner Clinic & Attending Veterinarian Setup
    const clinic = await facade.createClinic(activeShelterId, {
      name: "Compassion Vet Care",
      address: "101 Healing Way",
      phone: "555-CARE",
    });

    const vet = await facade.createVet(activeShelterId, {
      clinicId: clinic.id,
      name: "Dr. Emily Taylor",
      specialization: "Dermatology",
    });

    // 5. Veterinary Appointment & Diagnostic Upload
    const appt = await facade.createAppointment(activeShelterId, {
      petId: pet.id,
      clinicId: clinic.id,
      veterinarianId: vet.id,
      scheduledAt: "2024-03-01T10:00:00.000Z",
      notes: "Ear cytology and ear cleaning",
    });

    const doc = await facade.uploadAppointmentDocument?.(activeShelterId, appt.id, {
      fileName: "ear_cytology_report.pdf",
      mimeType: "application/pdf",
      fileSizeBytes: 4096,
      buffer: Buffer.from("CYTOLOGY_REPORT_DATA"),
    });
    expect(doc?.id).toBeDefined();

    // 6. Care Event Course (7-day antibiotic drops)
    const careEvent = await facade.createCareEvent(activeShelterId, {
      petId: pet.id,
      appointmentId: appt.id,
      modality: "Medication",
      substance: "Otic Drops",
      instructions: "Apply 4 drops to left ear daily",
      startDate: "2024-03-01T12:00:00.000Z",
      temporaryEndDate: "2024-03-07T12:00:00.000Z",
      recurrenceRule: {
        interval: 1,
        unit: "days",
      },
    });

    const careOccurrences = await facade.listCareOccurrences?.(pet.id, activeShelterId);
    expect(careOccurrences).toHaveLength(7);

    // Complete first 2 doses
    await facade.completeCareOccurrence?.(
      activeShelterId,
      careOccurrences![0].id,
      "2024-03-01T12:05:00.000Z",
      "Dose 1 applied"
    );
    await facade.completeCareOccurrence?.(
      activeShelterId,
      careOccurrences![1].id,
      "2024-03-02T12:00:00.000Z",
      "Dose 2 applied"
    );

    // 7. Verify Dashboard KPIs during treatment
    const midKpis = await facade.getDashboardOverview(activeShelterId);
    expect(midKpis.totalActivePets).toBe(1);
    expect(midKpis.petsInTreatment).toBe(1);

    // 8. Pet Recovers & Transitions to Foster
    await facade.updatePet(pet.id, activeShelterId, {
      healthStatus: "Healthy",
    });
    const inFoster = await facade.placeInFoster(pet.id, activeShelterId);
    expect(inFoster.status).toBe("in_foster");

    const fosterKpis = await facade.getDashboardOverview(activeShelterId);
    expect(fosterKpis.petsInFoster).toBe(1);
    expect(fosterKpis.petsInTreatment).toBe(0);

    // 9. Pet Returns and is Adopted
    await facade.returnFromFoster(pet.id, activeShelterId);
    const finalizedAdoption = await facade.transitionPetOutcome(
      pet.id,
      activeShelterId,
      "adopted",
      {
        name: "Samuel Green",
        phone: "555-9876",
        address: "42 Greenfield Rd",
      }
    );

    expect(finalizedAdoption.outcome).toBe("adopted");
    expect(finalizedAdoption.status).toBe("archived");
    expect(finalizedAdoption.availableForAdoption).toBe(false);

    // 10. Final Verification: Active count on dashboard drops to 0
    const finalKpis = await facade.getDashboardOverview(activeShelterId);
    expect(finalKpis.totalActivePets).toBe(0);
    expect(finalKpis.petsInFoster).toBe(0);
  });
});
