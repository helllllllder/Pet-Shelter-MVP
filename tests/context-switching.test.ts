import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { createTestDatabase, ScopedRepositoryFactory } from '@adapters/sqlite';
import { useActiveContextStore, useEntityCacheStore } from '@core/state';

describe('Active Shelter Context State & Switching Lifecycle Tests (FR04, TC-FR04-01..03)', () => {
  let db: any;
  let sqlite: any;
  let factory: ScopedRepositoryFactory;

  let shelterRepo: any;
  let operatorRepo: any;

  let shelterA: any;
  let shelterB: any;

  beforeEach(async () => {
    const instance = createTestDatabase(true);
    db = instance.db;
    sqlite = instance.sqlite;
    factory = new ScopedRepositoryFactory(db);

    shelterRepo = factory.getShelterRepository();
    operatorRepo = factory.getOperatorRepository();

    await operatorRepo.createProfile({
      id: '018e5b47-68f0-7b2a-8742-d11234567890',
      fullName: 'Alice Walker',
      email: 'alice@shelter.org',
      phone: null,
      lastActiveShelterId: null,
      deviceInstallId: 'device-test-unit',
    });

    shelterA = await shelterRepo.create({
      name: 'North Shelter',
      description: 'North facility',
      address: null,
      phone: null,
      email: null,
      isActive: true,
    });

    shelterB = await shelterRepo.create({
      name: 'South Sanctuary',
      description: 'South facility',
      address: null,
      phone: null,
      email: null,
      isActive: true,
    });

    // Reset Zustand stores
    useActiveContextStore.setState({
      activeShelterId: null,
      activeShelter: null,
      activeSession: null,
      isLoading: false,
      hasUnsavedChanges: false,
      isUnsavedModalVisible: false,
      pendingShelterId: null,
    });
    useEntityCacheStore.getState().clearCache();
  });

  afterEach(() => {
    sqlite.close();
  });

  it('TC-FR04-01: Context switch immediately updates active shelter and session context', async () => {
    const store = useActiveContextStore.getState();
    await store.initializeContext(shelterRepo, operatorRepo);

    expect(useActiveContextStore.getState().activeShelterId).toBe(shelterA.id);

    // Switch to Shelter B
    const switched = await useActiveContextStore
      .getState()
      .requestContextSwitch(shelterB.id, shelterRepo, operatorRepo);

    expect(switched).toBe(true);
    expect(useActiveContextStore.getState().activeShelterId).toBe(shelterB.id);
    expect(useActiveContextStore.getState().activeShelter?.name).toBe('South Sanctuary');

    const updatedProfile = await operatorRepo.getProfile();
    expect(updatedProfile?.lastActiveShelterId).toBe(shelterB.id);
  });

  it('TC-FR04-02: Context switch evicts in-memory entity cache before loading target shelter data', async () => {
    const contextStore = useActiveContextStore.getState();
    const cacheStore = useEntityCacheStore.getState();

    await contextStore.initializeContext(shelterRepo, operatorRepo);

    // Populate cache with Shelter A dummy pet
    cacheStore.setPets([
      {
        id: 'pet-a-1',
        shelterId: shelterA.id,
        name: 'Spot',
        species: 'CANINE',
        breed: 'Mutt',
        sex: 'MALE',
        color: 'Spotted',
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
        createdAt: '2026-08-28T20:00:00.000Z',
        updatedAt: '2026-08-28T20:00:00.000Z',
        deletedAt: null,
      },
    ]);

    expect(useEntityCacheStore.getState().pets.length).toBe(1);

    // Switch to Shelter B with cache eviction callback
    await useActiveContextStore.getState().requestContextSwitch(
      shelterB.id,
      shelterRepo,
      operatorRepo,
      () => useEntityCacheStore.getState().clearCache()
    );

    // Cache must be cleared
    expect(useEntityCacheStore.getState().pets.length).toBe(0);
  });

  it('TC-FR04-03: Prompts user when dirty/unsaved form state exists before allowing context switch', async () => {
    const store = useActiveContextStore.getState();
    await store.initializeContext(shelterRepo, operatorRepo);

    // Set unsaved changes flag
    useActiveContextStore.getState().setHasUnsavedChanges(true);

    // Attempt to switch to Shelter B
    const switched = await useActiveContextStore
      .getState()
      .requestContextSwitch(shelterB.id, shelterRepo, operatorRepo);

    // Must be blocked and show modal
    expect(switched).toBe(false);
    expect(useActiveContextStore.getState().isUnsavedModalVisible).toBe(true);
    expect(useActiveContextStore.getState().pendingShelterId).toBe(shelterB.id);
    expect(useActiveContextStore.getState().activeShelterId).toBe(shelterA.id);

    // Cancel switch
    useActiveContextStore.getState().cancelContextSwitch();
    expect(useActiveContextStore.getState().isUnsavedModalVisible).toBe(false);
    expect(useActiveContextStore.getState().activeShelterId).toBe(shelterA.id);

    // Re-request and confirm discard
    await useActiveContextStore.getState().requestContextSwitch(shelterB.id, shelterRepo, operatorRepo);
    await useActiveContextStore.getState().confirmContextSwitch(shelterRepo, operatorRepo);

    expect(useActiveContextStore.getState().activeShelterId).toBe(shelterB.id);
    expect(useActiveContextStore.getState().isUnsavedModalVisible).toBe(false);
    expect(useActiveContextStore.getState().hasUnsavedChanges).toBe(false);
  });
});
