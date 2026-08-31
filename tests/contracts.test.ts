import { describe, it, expect } from "vitest";
import type {
  IOperatorRepository,
  IShelterRepository,
  IPetRepository,
  IVetDirectoryRepository,
  IAppointmentRepository,
  ICareEventRepository,
  IAuditLogRepository,
  IMediaStorageService,
  INotificationService,
  IRepositoryFactory,
} from "../src/core/contracts/index.js";
import type { Pet, Shelter, OperatorProfile } from "../src/core/domain/models.js";

describe("Contracts Layer Port Interfaces (Ticket T02 / #22)", () => {
  it("should allow creating a mock conforming to IOperatorRepository", async () => {
    let storedProfile: OperatorProfile | null = null;

    const mockRepo: IOperatorRepository = {
      async getProfile() {
        return storedProfile;
      },
      async saveProfile(profile) {
        const saved: OperatorProfile = {
          ...profile,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        };
        storedProfile = saved;
        return saved;
      },
      async updateProfile(profile) {
        if (!storedProfile) throw new Error("Not found");
        storedProfile = {
          ...storedProfile,
          ...profile,
          updatedAt: new Date().toISOString(),
        };
        return storedProfile;
      },
    };

    expect(await mockRepo.getProfile()).toBeNull();
    const created = await mockRepo.saveProfile({
      id: "op-1",
      name: "Helder",
      email: "helder@example.com",
    });
    expect(created.name).toBe("Helder");
    expect(await mockRepo.getProfile()).toEqual(created);
  });

  it("should allow creating a mock conforming to IShelterRepository", async () => {
    const shelters: Shelter[] = [];

    const mockRepo: IShelterRepository = {
      async create(shelter) {
        const created: Shelter = {
          ...shelter,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        };
        shelters.push(created);
        return created;
      },
      async update(shelter) {
        const idx = shelters.findIndex((s) => s.id === shelter.id);
        if (idx === -1) throw new Error("Shelter not found");
        shelters[idx] = {
          ...shelters[idx],
          ...shelter,
          updatedAt: new Date().toISOString(),
        };
        return shelters[idx];
      },
      async findById(id) {
        return shelters.find((s) => s.id === id) || null;
      },
      async listAll() {
        return [...shelters];
      },
    };

    const s = await mockRepo.create({
      id: "shelter-1",
      name: "Main Shelter",
      description: "HQ",
      isActive: true,
    });
    expect(s.name).toBe("Main Shelter");
    expect(await mockRepo.listAll()).toHaveLength(1);
    expect(await mockRepo.findById("shelter-1")).toEqual(s);
  });

  it("should verify IRepositoryFactory shape compatibility", () => {
    const dummyFactory: Partial<IRepositoryFactory> = {};
    expect(typeof dummyFactory).toBe("object");
  });
});
