import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { createTestDatabase, ScopedRepositoryFactory } from '@adapters/sqlite';
import {
  CreateShelterUseCase,
  UpdateShelterUseCase,
  ListSheltersUseCase,
  RegisterOperatorUseCase,
} from '@core/usecases';

describe('Local Multi-Shelter Container Management Tests (FR02, FR04, TC-FR02-01..04)', () => {
  let db: any;
  let sqlite: any;
  let factory: ScopedRepositoryFactory;
  let shelterRepo: any;
  let operatorRepo: any;

  beforeEach(async () => {
    const instance = createTestDatabase(true);
    db = instance.db;
    sqlite = instance.sqlite;
    factory = new ScopedRepositoryFactory(db);
    shelterRepo = factory.getShelterRepository();
    operatorRepo = factory.getOperatorRepository();

    const registerOp = new RegisterOperatorUseCase(operatorRepo);
    await registerOp.execute({
      fullName: 'Sam Taylor',
      email: 'sam@petrescue.org',
    });
  });

  afterEach(() => {
    sqlite.close();
  });

  it('TC-FR02-01: Creating first shelter automatically sets it as active context in operator profile', async () => {
    const createUseCase = new CreateShelterUseCase(shelterRepo, operatorRepo);

    const shelter = await createUseCase.execute({
      name: 'Paws Sanctuary',
      description: 'First facility',
    });

    expect(shelter.id).toBeDefined();
    expect(shelter.name).toBe('Paws Sanctuary');
    expect(shelter.isActive).toBe(true);

    const profile = await operatorRepo.getProfile();
    expect(profile?.lastActiveShelterId).toBe(shelter.id);
  });

  it('TC-FR02-02: Duplicate shelter names are permitted across containers', async () => {
    const createUseCase = new CreateShelterUseCase(shelterRepo, operatorRepo);

    const s1 = await createUseCase.execute({ name: 'Happy Paws' });
    const s2 = await createUseCase.execute({ name: 'Happy Paws' });

    expect(s1.id).not.toBe(s2.id);
    expect(s1.name).toBe(s2.name);

    const allShelters = await shelterRepo.listAll();
    expect(allShelters.length).toBe(2);
  });

  it('TC-FR02-03: Editing shelter details updates record properly', async () => {
    const createUseCase = new CreateShelterUseCase(shelterRepo, operatorRepo);
    const updateUseCase = new UpdateShelterUseCase(shelterRepo);

    const created = await createUseCase.execute({
      name: 'Initial Name',
      phone: '+1 555 1234',
    });

    const updated = await updateUseCase.execute(created.id, {
      name: 'Renamed Shelter',
      phone: '+1 555 9999',
    });

    expect(updated.name).toBe('Renamed Shelter');
    expect(updated.phone).toBe('+1 555 9999');

    const fetched = await shelterRepo.getById(created.id);
    expect(fetched?.name).toBe('Renamed Shelter');
  });

  it('TC-FR02-04: Creating multiple independent shelters lists all containers', async () => {
    const createUseCase = new CreateShelterUseCase(shelterRepo, operatorRepo);
    const listUseCase = new ListSheltersUseCase(shelterRepo);

    await createUseCase.execute({ name: 'Shelter One' });
    await createUseCase.execute({ name: 'Shelter Two' });
    await createUseCase.execute({ name: 'Shelter Three' });

    const list = await listUseCase.execute();
    expect(list.length).toBe(3);
    const names = list.map((s) => s.name);
    expect(names).toContain('Shelter One');
    expect(names).toContain('Shelter Two');
    expect(names).toContain('Shelter Three');
  });
});
