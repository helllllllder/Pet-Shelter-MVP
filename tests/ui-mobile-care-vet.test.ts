import { describe, it, expect, beforeEach } from "vitest";
import { useVetStore } from "../packages/ui-mobile/src/stores/vet-store";
import { useCareStore } from "../packages/ui-mobile/src/stores/care-store";
import { useShelterStore } from "../packages/ui-mobile/src/stores/shelter-store";
import { usePetStore } from "../packages/ui-mobile/src/stores/pet-store";

describe("Mobile Veterinary Directory & Care Events Engine (ADR 0002)", () => {
  const shelterA = "shelter-a";
  const shelterB = "shelter-b";

  beforeEach(() => {
    useVetStore.setState({ clinics: [], veterinarians: [] });
    useCareStore.setState({ careEvents: [], occurrences: [] });
    useShelterStore.setState({ shelters: [], activeShelterId: null });
    usePetStore.setState({ pets: [], selectedPetId: null });
  });

  describe("1. Veterinary Directory Store (useVetStore)", () => {
    it("should register partner clinics scoped to a shelter", () => {
      useVetStore.getState().addClinic({
        id: "clinic-1",
        shelterId: shelterA,
        name: "North Star Veterinary Hospital",
        address: "123 Compass Way",
        phone: "555-1000",
        isEmergency: true,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      });

      const { clinics } = useVetStore.getState();
      expect(clinics).toHaveLength(1);
      expect(clinics[0].name).toBe("North Star Veterinary Hospital");
      expect(clinics[0].isEmergency).toBe(true);
    });

    it("should add veterinarians linked to a clinic", () => {
      useVetStore.getState().addClinic({
        id: "clinic-1",
        shelterId: shelterA,
        name: "North Star Veterinary Hospital",
        isEmergency: false,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      });

      useVetStore.getState().addVeterinarian({
        id: "vet-1",
        shelterId: shelterA,
        clinicId: "clinic-1",
        name: "Dr. Gregory House",
        specialization: "Diagnostics",
        licenseNumber: "LIC-9988",
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      });

      const { veterinarians } = useVetStore.getState();
      expect(veterinarians).toHaveLength(1);
      expect(veterinarians[0].clinicId).toBe("clinic-1");
      expect(veterinarians[0].name).toBe("Dr. Gregory House");
    });

    it("should cascade delete veterinarians when a clinic is removed", () => {
      useVetStore.getState().addClinic({
        id: "clinic-1",
        shelterId: shelterA,
        name: "Clinic To Delete",
        isEmergency: false,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      });

      useVetStore.getState().addVeterinarian({
        id: "vet-1",
        shelterId: shelterA,
        clinicId: "clinic-1",
        name: "Dr. John Watson",
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      });

      useVetStore.getState().deleteClinic("clinic-1");

      expect(useVetStore.getState().clinics).toHaveLength(0);
      expect(useVetStore.getState().veterinarians).toHaveLength(0);
    });
  });

  describe("2. Care Events & Recurrence Engine (useCareStore)", () => {
    it("should create a one-off care event and project 1 occurrence", () => {
      useCareStore.getState().addCareEvent({
        id: "event-1",
        shelterId: shelterA,
        petId: "pet-1",
        modality: "Vaccine",
        substance: "Rabies 3-Year",
        startDate: "2026-09-01",
        recurrenceRule: null,
        status: "active",
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      });

      const { careEvents, occurrences } = useCareStore.getState();
      expect(careEvents).toHaveLength(1);
      expect(occurrences).toHaveLength(1);
      expect(occurrences[0].substance).toBe("Rabies 3-Year");
      expect(occurrences[0].dueDate).toBe("2026-09-01");
      expect(occurrences[0].status).toBe("scheduled");
    });

    it("should project recurring occurrences according to recurrence interval", () => {
      useCareStore.getState().addCareEvent({
        id: "event-rec",
        shelterId: shelterA,
        petId: "pet-1",
        modality: "Medication",
        substance: "Amoxicillin 250mg",
        startDate: "2026-09-01",
        recurrenceRule: {
          frequency: "daily",
          interval: 1,
          count: 5,
        },
        status: "active",
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      });

      const { occurrences } = useCareStore.getState();
      expect(occurrences).toHaveLength(5);
      expect(occurrences[0].dueDate).toBe("2026-09-01");
      expect(occurrences[1].dueDate).toBe("2026-09-02");
      expect(occurrences[4].dueDate).toBe("2026-09-05");
    });

    it("should mark occurrence completed with execution details", () => {
      useCareStore.getState().addCareEvent({
        id: "event-1",
        shelterId: shelterA,
        petId: "pet-1",
        modality: "Vermifuge",
        substance: "Drontal Plus",
        startDate: "2026-09-01",
        status: "active",
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      });

      const occId = useCareStore.getState().occurrences[0].id;
      useCareStore.getState().completeOccurrence(occId, "Given with lunch");

      const updatedOcc = useCareStore.getState().occurrences[0];
      expect(updatedOcc.status).toBe("completed");
      expect(updatedOcc.completionNotes).toBe("Given with lunch");
      expect(updatedOcc.completedAt).toBeDefined();
    });

    it("should mark occurrence skipped with justification reason", () => {
      useCareStore.getState().addCareEvent({
        id: "event-1",
        shelterId: shelterA,
        petId: "pet-1",
        modality: "Grooming",
        substance: "Medicated Bath",
        startDate: "2026-09-01",
        status: "active",
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      });

      const occId = useCareStore.getState().occurrences[0].id;
      useCareStore.getState().skipOccurrence(occId, "Pet has open skin lesion");

      const updatedOcc = useCareStore.getState().occurrences[0];
      expect(updatedOcc.status).toBe("skipped");
      expect(updatedOcc.skippedReason).toBe("Pet has open skin lesion");
    });

    it("should cancel care event and prune its pending occurrences", () => {
      useCareStore.getState().addCareEvent({
        id: "event-cancel",
        shelterId: shelterA,
        petId: "pet-1",
        modality: "PhysicalTherapy",
        substance: "Underwater Treadmill",
        startDate: "2026-09-01",
        recurrenceRule: { frequency: "weekly", interval: 1, count: 4 },
        status: "active",
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      });

      expect(useCareStore.getState().occurrences).toHaveLength(4);

      useCareStore.getState().cancelCareEvent("event-cancel");

      expect(useCareStore.getState().careEvents[0].status).toBe("cancelled");
      expect(useCareStore.getState().occurrences).toHaveLength(0);
    });
  });
});
