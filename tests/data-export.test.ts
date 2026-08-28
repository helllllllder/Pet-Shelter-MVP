import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { createTestDatabase, ScopedRepositoryFactory } from '@adapters/sqlite';
import { LocalDataExportService } from '@adapters/export';
import { RegisterOperatorUseCase, CreateShelterUseCase } from '@core/usecases';

describe('Structured Data Export Tests (FR03, NFR15, TC-FR03-01..03)', () => {
  let db: any;
  let sqlite: any;
  let factory: ScopedRepositoryFactory;
  let exportService: LocalDataExportService;

  let shelterAId: string;
  let shelterBId: string;

  beforeEach(async () => {
    const instance = createTestDatabase(true);
    db = instance.db;
    sqlite = instance.sqlite;
    factory = new ScopedRepositoryFactory(db);
    exportService = new LocalDataExportService(db);

    const operatorRepo = factory.getOperatorRepository();
    const shelterRepo = factory.getShelterRepository();

    const regOp = new RegisterOperatorUseCase(operatorRepo);
    await regOp.execute({
      fullName: 'Dr. Emily Vance',
      email: 'emily@havenpets.org',
    });

    const createShelter = new CreateShelterUseCase(shelterRepo, operatorRepo);
    const sA = await createShelter.execute({ name: 'Haven East' });
    const sB = await createShelter.execute({ name: 'Haven West' });

    shelterAId = sA.id;
    shelterBId = sB.id;

    // Add pets to Shelter A
    const sessionA = factory.createSession(shelterAId);
    const petRepoA = factory.getPetRepository(sessionA);
    await petRepoA.create({
      name: 'Oliver',
      species: 'FELINE',
      breed: 'Persian',
      sex: 'MALE',
      color: 'White',
      dateOfBirth: '2021-06-15',
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
  });

  afterEach(() => {
    sqlite.close();
  });

  it('TC-FR03-01: Single shelter export produces valid JSON envelope with only target shelter records', async () => {
    const result = await exportService.exportData({
      exportType: 'SINGLE_SHELTER',
      targetShelterId: shelterAId,
    });

    expect(result.checksumSha256).toMatch(/^[a-f0-9]{64}$/);
    expect(result.totalRecordsCount).toBe(2); // 1 shelter + 1 pet
    expect(result.filePath).toContain('single_shelter');
  });

  it('TC-FR03-02: All shelters export bundles all device containers and calculates SHA-256', async () => {
    const result = await exportService.exportData({
      exportType: 'ALL_SHELTERS',
    });

    expect(result.checksumSha256).toMatch(/^[a-f0-9]{64}$/);
    expect(result.totalRecordsCount).toBe(3); // 2 shelters + 1 pet
    expect(result.filePath).toContain('all_shelters');
  });

  it('Rejects SINGLE_SHELTER export if targetShelterId is omitted', async () => {
    await expect(
      exportService.exportData({
        exportType: 'SINGLE_SHELTER',
      })
    ).rejects.toThrow('[EXPORT_FAILED]');
  });
});
