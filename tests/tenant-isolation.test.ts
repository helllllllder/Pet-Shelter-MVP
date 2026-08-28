import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { createTestDatabase, ScopedRepositoryFactory } from '@adapters/sqlite';
import { generateUUIDv7 } from '@core/domain';

describe('Local Multi-Tenant Isolation & Scoped Repository Tests (NFR08)', () => {
  let db: any;
  let sqlite: any;
  let factory: ScopedRepositoryFactory;

  let shelterAId: string;
  let shelterBId: string;

  beforeEach(async () => {
    const instance = createTestDatabase(true);
    db = instance.db;
    sqlite = instance.sqlite;
    factory = new ScopedRepositoryFactory(db);

    const shelterRepo = factory.getShelterRepository();
    const sA = await shelterRepo.create({
      name: 'Shelter Alpha',
      description: 'Alpha Container',
      address: null,
      phone: null,
      email: null,
      isActive: true,
    });
    const sB = await shelterRepo.create({
      name: 'Shelter Beta',
      description: 'Beta Container',
      address: null,
      phone: null,
      email: null,
      isActive: true,
    });

    shelterAId = sA.id;
    shelterBId = sB.id;
  });

  afterEach(() => {
    sqlite.close();
  });

  it('Strictly isolates pet queries between Shelter A and Shelter B', async () => {
    const sessionA = factory.createSession(shelterAId);
    const sessionB = factory.createSession(shelterBId);

    const petRepoA = factory.getPetRepository(sessionA);
    const petRepoB = factory.getPetRepository(sessionB);

    // Create pet in Shelter A
    const petA = await petRepoA.create({
      name: 'Alpha Dog',
      species: 'CANINE',
      breed: 'Shepherd',
      sex: 'MALE',
      color: 'Black',
      dateOfBirth: '2022-01-01',
      isDobEstimated: false,
      intakeOrigin: 'STREET_RESCUE',
      intakeOriginDetails: null,
      healthStatus: 'HEALTHY',
      healthConditions: [],
      isAvailableForAdoption: true,
      outcomeStatus: 'ACTIVE',
      outcomeDate: null,
      outcomeNotes: null,
      mediaReferences: [],
    });

    // Create pet in Shelter B
    const petB = await petRepoB.create({
      name: 'Beta Cat',
      species: 'FELINE',
      breed: 'Siamese',
      sex: 'FEMALE',
      color: 'Cream',
      dateOfBirth: '2023-01-01',
      isDobEstimated: true,
      intakeOrigin: 'BORN_IN_SHELTER',
      intakeOriginDetails: null,
      healthStatus: 'HEALTHY',
      healthConditions: [],
      isAvailableForAdoption: true,
      outcomeStatus: 'ACTIVE',
      outcomeDate: null,
      outcomeNotes: null,
      mediaReferences: [],
    });

    // Verify Shelter A only sees Pet A
    const listA = await petRepoA.listActive();
    expect(listA.length).toBe(1);
    expect(listA[0].name).toBe('Alpha Dog');

    // Verify Shelter B cannot fetch Pet A by ID
    const crossFetch = await petRepoB.getById(petA.id);
    expect(crossFetch).toBeNull();

    // Verify Shelter B only sees Pet B
    const listB = await petRepoB.listActive();
    expect(listB.length).toBe(1);
    expect(listB[0].name).toBe('Beta Cat');
  });

  it('Throws [TENANT_ISOLATION_VIOLATION] if session is initialized with empty shelter ID', () => {
    expect(() => {
      factory.createSession('');
    }).toThrow('[TENANT_ISOLATION_VIOLATION]');
  });

  it('Soft delete filters out deleted pets from active list', async () => {
    const sessionA = factory.createSession(shelterAId);
    const petRepoA = factory.getPetRepository(sessionA);

    const pet = await petRepoA.create({
      name: 'Rex',
      species: 'CANINE',
      breed: 'Beagle',
      sex: 'MALE',
      color: 'Tricolor',
      dateOfBirth: '2021-03-01',
      isDobEstimated: false,
      intakeOrigin: 'OWNER_SURRENDER',
      intakeOriginDetails: null,
      healthStatus: 'HEALTHY',
      healthConditions: [],
      isAvailableForAdoption: true,
      outcomeStatus: 'ACTIVE',
      outcomeDate: null,
      outcomeNotes: null,
      mediaReferences: [],
    });

    let activePets = await petRepoA.listActive();
    expect(activePets.length).toBe(1);

    await petRepoA.softDelete(pet.id);

    activePets = await petRepoA.listActive();
    expect(activePets.length).toBe(0);

    const fetchDeleted = await petRepoA.getById(pet.id);
    expect(fetchDeleted).toBeNull();
  });
});
