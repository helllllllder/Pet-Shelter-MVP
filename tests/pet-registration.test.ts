import { describe, it, expect, beforeEach } from "vitest";
import { createDatabase, type LunaDatabase } from "../src/adapters/sqlite/database.js";
import { SqliteRepositoryFactory } from "../src/adapters/sqlite/repositories/index.js";
import { PetService } from "../packages/app-core/src/pet-service.js";
import { generateUUIDv7 } from "../src/core/domain/uuid.js";
import type { IMediaStorageService } from "../src/core/contracts/services.js";

describe("Pet Registration & Demographics (Ticket T07 / #25)", () => {
  let db: LunaDatabase;
  let factory: SqliteRepositoryFactory;
  let petService: PetService;
  let shelterId: string;
  let shelterBId: string;

  // In-memory mock media storage service
  const mockStorage: IMediaStorageService = {
    storedFiles: new Map<string, Buffer>(),
    async storeFile(buffer, fileName, mimeType, sId) {
      const filePath = `uploads/${sId}/${fileName}`;
      this.storedFiles.set(filePath, Buffer.from(buffer));
      return { filePath, fileSizeBytes: buffer.length };
    },
    async readFile(filePath) {
      const buf = this.storedFiles.get(filePath);
      if (!buf) throw new Error("File not found");
      return buf;
    },
    async deleteFile(filePath) {
      return this.storedFiles.delete(filePath);
    },
  } as IMediaStorageService & { storedFiles: Map<string, Buffer> };

  beforeEach(async () => {
    const initialized = createDatabase(":memory:");
    db = initialized.db;
    factory = new SqliteRepositoryFactory(db);
    petService = new PetService(factory.petRepo, factory.auditLogRepo, mockStorage);

    shelterId = generateUUIDv7();
    shelterBId = generateUUIDv7();

    await factory.shelterRepo.create({
      id: shelterId,
      name: "Sunny Meadows Shelter",
      description: "Main Shelter",
      isActive: true,
    });

    await factory.shelterRepo.create({
      id: shelterBId,
      name: "Riverdale Shelter",
      description: "East Shelter",
      isActive: true,
    });
  });

  describe("1. Pet Registration (FR05, FR06)", () => {
    it("should register a new pet with full demographics and estimated DOB flag", async () => {
      const pet = await petService.registerPet(shelterId, {
        name: "Barnaby",
        dob: "2022-04-15",
        isDobEstimated: true,
        species: "Dog",
        breed: "Golden Retriever",
        sex: "Male",
        color: "Blonde",
        intakeOrigin: "STREET_RESCUE",
        intakeOriginDetail: "Found wandering near park",
        healthConditions: JSON.stringify(["Heartworm Negative"]),
        healthStatus: "Healthy",
        availableForAdoption: true,
      });

      expect(pet.id).toBeDefined();
      expect(pet.shelterId).toBe(shelterId);
      expect(pet.name).toBe("Barnaby");
      expect(pet.dob).toBe("2022-04-15");
      expect(pet.isDobEstimated).toBe(true);
      expect(pet.species).toBe("Dog");
      expect(pet.breed).toBe("Golden Retriever");
      expect(pet.sex).toBe("Male");
      expect(pet.color).toBe("Blonde");
      expect(pet.intakeOrigin).toBe("STREET_RESCUE");
      expect(pet.intakeOriginDetail).toBe("Found wandering near park");
      expect(pet.healthStatus).toBe("Healthy");
      expect(pet.availableForAdoption).toBe(true);
      expect(pet.outcomeStatus).toBeNull();
      expect(pet.isArchived).toBe(false);

      // Verify audit log creation
      const logs = await factory.auditLogRepo.listByShelter(shelterId);
      expect(logs).toHaveLength(1);
      expect(logs[0].action).toBe("CREATE");
      expect(logs[0].entityId).toBe(pet.id);
    });

    it("should allow duplicate pet names within the same shelter", async () => {
      const pet1 = await petService.registerPet(shelterId, {
        name: "Max",
        dob: "2021-01-01",
        isDobEstimated: false,
        species: "Dog",
        breed: "Labrador",
        sex: "Male",
        color: "Black",
        intakeOrigin: "OWNER_SURRENDER",
        healthStatus: "Healthy",
        availableForAdoption: true,
      });

      const pet2 = await petService.registerPet(shelterId, {
        name: "Max",
        dob: "2023-05-10",
        isDobEstimated: false,
        species: "Cat",
        breed: "Siamese",
        sex: "Male",
        color: "Seal Point",
        intakeOrigin: "BORN_AT_SHELTER",
        healthStatus: "Healthy",
        availableForAdoption: false,
      });

      expect(pet1.id).not.toBe(pet2.id);
      expect(pet1.name).toBe("Max");
      expect(pet2.name).toBe("Max");
    });

    it("should reject registration if required fields are missing", async () => {
      await expect(
        petService.registerPet(shelterId, {
          name: "",
          dob: "2022-01-01",
          isDobEstimated: false,
          species: "Dog",
          breed: "Lab",
          sex: "Male",
          color: "Black",
          intakeOrigin: "STREET_RESCUE",
          healthStatus: "Healthy",
          availableForAdoption: true,
        })
      ).rejects.toThrow();
    });
  });

  describe("2. Pet Profile Retrieval & Scoped Listing (FR05, FR08)", () => {
    it("should retrieve a pet profile strictly within its shelter context", async () => {
      const pet = await petService.registerPet(shelterId, {
        name: "Mittens",
        dob: "2020-03-01",
        isDobEstimated: false,
        species: "Cat",
        breed: "Tabby",
        sex: "Female",
        color: "Striped",
        intakeOrigin: "STREET_RESCUE",
        healthStatus: "Healthy",
        availableForAdoption: true,
      });

      const foundInA = await petService.getPet(pet.id, shelterId);
      expect(foundInA).toEqual(pet);

      // Isolation: Looking up in Shelter B returns null
      const foundInB = await petService.getPet(pet.id, shelterBId);
      expect(foundInB).toBeNull();
    });

    it("should search pets with case-insensitive name matching and filters", async () => {
      await petService.registerPet(shelterId, {
        name: "Alexander The Great",
        dob: "2021-01-01",
        isDobEstimated: false,
        species: "Dog",
        breed: "Great Dane",
        sex: "Male",
        color: "Harlequin",
        intakeOrigin: "STREET_RESCUE",
        healthStatus: "Healthy",
        availableForAdoption: true,
      });

      await petService.registerPet(shelterId, {
        name: "Alex",
        dob: "2022-02-02",
        isDobEstimated: false,
        species: "Cat",
        breed: "Domestic Shorthair",
        sex: "Female",
        color: "Orange",
        intakeOrigin: "OWNER_SURRENDER",
        healthStatus: "In Treatment",
        availableForAdoption: false,
      });

      // Search query "alex" (case-insensitive) matches both
      const queryResults = await petService.listPets(shelterId, { query: "alex" });
      expect(queryResults).toHaveLength(2);

      // Filter by species "Dog"
      const dogs = await petService.listPets(shelterId, { species: "Dog" });
      expect(dogs).toHaveLength(1);
      expect(dogs[0].name).toBe("Alexander The Great");

      // Filter by available for adoption
      const adoptables = await petService.listPets(shelterId, { availableForAdoption: true });
      expect(adoptables).toHaveLength(1);
      expect(adoptables[0].name).toBe("Alexander The Great");
    });
  });

  describe("3. Pet Profile Updates (FR05, FR08)", () => {
    it("should update pet profile fields and record audit log", async () => {
      const pet = await petService.registerPet(shelterId, {
        name: "Shadow",
        dob: "2021-06-01",
        isDobEstimated: false,
        species: "Cat",
        breed: "Domestic",
        sex: "Male",
        color: "Black",
        intakeOrigin: "STREET_RESCUE",
        healthStatus: "In Treatment",
        availableForAdoption: false,
      });

      const updated = await petService.updatePet(pet.id, shelterId, {
        healthStatus: "Healthy",
        availableForAdoption: true,
      });

      expect(updated.healthStatus).toBe("Healthy");
      expect(updated.availableForAdoption).toBe(true);

      const logs = await factory.auditLogRepo.listByShelter(shelterId);
      const updateLogs = logs.filter((l) => l.action === "UPDATE");
      expect(updateLogs).toHaveLength(1);
      expect(updateLogs[0].entityId).toBe(pet.id);
    });

    it("should reject update if pet does not exist in shelter", async () => {
      const nonExistentId = generateUUIDv7();
      await expect(
        petService.updatePet(nonExistentId, shelterId, { name: "Ghost" })
      ).rejects.toThrow();
    });
  });

  describe("4. Hard Deletion & Archival Guard (FR08, FR08-B)", () => {
    it("should hard-delete an active pet profile and its media", async () => {
      const pet = await petService.registerPet(shelterId, {
        name: "Temporary Pet",
        dob: "2023-01-01",
        isDobEstimated: false,
        species: "Rabbit",
        breed: "Dutch",
        sex: "Female",
        color: "White",
        intakeOrigin: "STREET_RESCUE",
        healthStatus: "Healthy",
        availableForAdoption: true,
      });

      // Add media
      await petService.uploadMedia(shelterId, pet.id, {
        fileName: "photo.jpg",
        mimeType: "image/jpeg",
        buffer: Buffer.from("image content"),
      });

      await petService.hardDeletePet(pet.id, shelterId);

      const notFound = await petService.getPet(pet.id, shelterId);
      expect(notFound).toBeNull();

      const media = await petService.getMedia(pet.id, shelterId);
      expect(media).toHaveLength(0);

      const logs = await factory.auditLogRepo.listByShelter(shelterId);
      const deleteLogs = logs.filter((l) => l.action === "DELETE");
      expect(deleteLogs).toHaveLength(1);
    });

    it("should prohibit hard deletion for archived pets", async () => {
      const pet = await petService.registerPet(shelterId, {
        name: "Archived Pet",
        dob: "2020-01-01",
        isDobEstimated: false,
        species: "Dog",
        breed: "Beagle",
        sex: "Male",
        color: "Tricolor",
        intakeOrigin: "STREET_RESCUE",
        healthStatus: "Healthy",
        availableForAdoption: false,
      });

      // Manually transition to archived
      await factory.petRepo.update({
        id: pet.id,
        shelterId,
        isArchived: true,
        outcomeStatus: "Adopted",
      });

      await expect(petService.hardDeletePet(pet.id, shelterId)).rejects.toThrow(
        /Cannot delete archived pet/i
      );
    });
  });

  describe("5. Media Asset Management (FR07, FR07-B)", () => {
    it("should upload and delete photo and video media assets", async () => {
      const pet = await petService.registerPet(shelterId, {
        name: "Kona",
        dob: "2022-01-01",
        isDobEstimated: false,
        species: "Dog",
        breed: "Husky",
        sex: "Female",
        color: "Grey/White",
        intakeOrigin: "STREET_RESCUE",
        healthStatus: "Healthy",
        availableForAdoption: true,
      });

      const media = await petService.uploadMedia(shelterId, pet.id, {
        fileName: "kona-profile.jpg",
        mimeType: "image/jpeg",
        buffer: Buffer.from("dummy jpeg data"),
      });

      expect(media.id).toBeDefined();
      expect(media.petId).toBe(pet.id);
      expect(media.mediaType).toBe("PHOTO");
      expect(media.filePath).toContain("kona-profile.jpg");

      const allMedia = await petService.getMedia(pet.id, shelterId);
      expect(allMedia).toHaveLength(1);

      const deleted = await petService.deleteMedia(media.id, pet.id, shelterId);
      expect(deleted).toBe(true);

      const remainingMedia = await petService.getMedia(pet.id, shelterId);
      expect(remainingMedia).toHaveLength(0);
    });

    it("should reject unsupported media MIME types", async () => {
      const pet = await petService.registerPet(shelterId, {
        name: "Rusty",
        dob: "2022-01-01",
        isDobEstimated: false,
        species: "Dog",
        breed: "Mutt",
        sex: "Male",
        color: "Brown",
        intakeOrigin: "STREET_RESCUE",
        healthStatus: "Healthy",
        availableForAdoption: true,
      });

      await expect(
        petService.uploadMedia(shelterId, pet.id, {
          fileName: "document.pdf",
          mimeType: "application/pdf",
          buffer: Buffer.from("pdf data"),
        })
      ).rejects.toThrow(/Unsupported media MIME type/i);
    });
  });

  describe("6. Detailed Central Pet View (FR05)", () => {
    it("should retrieve aggregated pet profile with attached media", async () => {
      const pet = await petService.registerPet(shelterId, {
        name: "Simba",
        dob: "2021-08-01",
        isDobEstimated: false,
        species: "Cat",
        breed: "Lionhead",
        sex: "Male",
        color: "Orange",
        intakeOrigin: "OTHER",
        intakeOriginDetail: "Surrendered at public event",
        healthStatus: "Healthy",
        availableForAdoption: true,
      });

      await petService.uploadMedia(shelterId, pet.id, {
        fileName: "simba-front.png",
        mimeType: "image/png",
        buffer: Buffer.from("png data"),
      });

      const details = await petService.getPetDetails(pet.id, shelterId);
      expect(details).not.toBeNull();
      expect(details?.pet.name).toBe("Simba");
      expect(details?.pet.intakeOriginDetail).toBe("Surrendered at public event");
      expect(details?.media).toHaveLength(1);
      expect(details?.media[0].filePath).toContain("simba-front.png");
    });

    it("should require intakeOriginDetail when intakeOrigin is OTHER", async () => {
      await expect(
        petService.registerPet(shelterId, {
          name: "No Detail Pet",
          dob: "2022-01-01",
          isDobEstimated: false,
          species: "Dog",
          breed: "Mutt",
          sex: "Male",
          color: "Brown",
          intakeOrigin: "OTHER",
          intakeOriginDetail: "",
          healthStatus: "Healthy",
          availableForAdoption: true,
        })
      ).rejects.toThrow(/Intake origin detail is required/i);
    });
  });
});

