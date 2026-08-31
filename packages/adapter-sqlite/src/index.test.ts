import { describe, it, expect, beforeEach } from "vitest";
import {
  createDatabase,
  SqliteRepositoryFactory,
  SqliteOperatorRepository,
  SqliteShelterRepository,
  SqlitePetRepository,
  SqliteVetDirectoryRepository,
  SqliteAppointmentRepository,
  SqliteCareEventRepository,
  SqliteAuditLogRepository,
} from "./index.js";
import { generateUUIDv7 } from "../../domain/src/index.js";

describe("@luna/adapter-sqlite Package Exports & Repositories", () => {
  it("should export database creation and all repository classes", () => {
    expect(createDatabase).toBeDefined();
    expect(SqliteRepositoryFactory).toBeDefined();
    expect(SqliteOperatorRepository).toBeDefined();
    expect(SqliteShelterRepository).toBeDefined();
    expect(SqlitePetRepository).toBeDefined();
    expect(SqliteVetDirectoryRepository).toBeDefined();
    expect(SqliteAppointmentRepository).toBeDefined();
    expect(SqliteCareEventRepository).toBeDefined();
    expect(SqliteAuditLogRepository).toBeDefined();
  });

  it("should initialize factory and repositories on in-memory database", async () => {
    const { db } = createDatabase(":memory:");
    const factory = new SqliteRepositoryFactory(db);

    expect(factory.operatorRepo).toBeInstanceOf(SqliteOperatorRepository);
    expect(factory.shelterRepo).toBeInstanceOf(SqliteShelterRepository);
    expect(factory.petRepo).toBeInstanceOf(SqlitePetRepository);
    expect(factory.vetDirectoryRepo).toBeInstanceOf(SqliteVetDirectoryRepository);
    expect(factory.appointmentRepo).toBeInstanceOf(SqliteAppointmentRepository);
    expect(factory.careEventRepo).toBeInstanceOf(SqliteCareEventRepository);
    expect(factory.auditLogRepo).toBeInstanceOf(SqliteAuditLogRepository);

    const shelter = await factory.shelterRepo.create({
      id: generateUUIDv7(),
      name: "Package Test Shelter",
      description: null,
      isActive: true,
    });

    expect(shelter.name).toBe("Package Test Shelter");
  });
});
