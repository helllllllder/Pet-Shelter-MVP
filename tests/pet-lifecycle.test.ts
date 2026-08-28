import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { createTestDatabase, ScopedRepositoryFactory } from '@adapters/sqlite';
import { CreateShelterUseCase, RegisterOperatorUseCase, CreatePetUseCase, SetPetOutcomeUseCase } from '@core/usecases';

describe('Pet Profiles & Lifecycle Management Tests (FR05, FR06, FR08, FR09)', () => {
  let db: any;
  let sqlite: any;
  let factory: ScopedRepositoryFactory;
  let session: any;
  let petRepo: any;

  beforeEach(async () => {
    const instance = createTestDatabase(true);
    db = instance.db;
    sqlite = instance.sqlite;
    factory = new ScopedRepositoryFactory(db);

    const operatorRepo = factory.getOperatorRepository();
    const shelterRepo = factory.getShelterRepository();

    const regOp = new RegisterOperatorUseCase(operatorRepo);
    await regOp.execute({ fullName: 'Operator Sarah', email: 'sarah@shelter.org' });

    const createShelter = new CreateShelterUseCase(shelterRepo, operatorRepo);
    const shelter = await createShelter.execute({ name: 'Central Haven' });

    session = factory.createSession(shelter.id);
    petRepo = factory.getPetRepository(session);
  });

  afterEach(() => {
    sqlite.close();
  });

  it('TC-FR05-01: Registers pet profile with valid demographics and estimated DOB', async () => {
    const createPet = new CreatePetUseCase(petRepo);

    const pet = await createPet.execute({
      name: 'Bella',
      species: 'CANINE',
      breed: 'Labrador',
      sex: 'FEMALE',
      color: 'Chocolate',
      dateOfBirth: '2020-03-01',
      isDobEstimated: true,
      intakeOrigin: 'STREET_RESCUE',
      healthStatus: 'HEALTHY',
    });

    expect(pet.id).toBeDefined();
    expect(pet.name).toBe('Bella');
    expect(pet.isDobEstimated).toBe(true);
    expect(pet.outcomeStatus).toBe('ACTIVE');

    const list = await petRepo.listActive();
    expect(list.length).toBe(1);
    expect(list[0].name).toBe('Bella');
  });

  it('TC-FR05-04: Rejects registration if intakeOrigin is OTHER and intakeOriginDetails is omitted', async () => {
    const createPet = new CreatePetUseCase(petRepo);

    await expect(
      createPet.execute({
        name: 'Rocky',
        species: 'CANINE',
        breed: 'Boxer',
        sex: 'MALE',
        color: 'Fawn',
        dateOfBirth: '2019-01-01',
        intakeOrigin: 'OTHER',
        intakeOriginDetails: '', // Missing required free-text!
      })
    ).rejects.toThrow();
  });

  it('TC-FR08-01: Setting outcome to IN_FOSTER preserves active status with foster tagging', async () => {
    const createPet = new CreatePetUseCase(petRepo);
    const setOutcome = new SetPetOutcomeUseCase(petRepo, db);

    const pet = await createPet.execute({
      name: 'Milo',
      species: 'FELINE',
      breed: 'Tabby',
      sex: 'MALE',
      color: 'Striped',
      dateOfBirth: '2022-01-01',
      intakeOrigin: 'STREET_RESCUE',
    });

    const updated = await setOutcome.execute({
      petId: pet.id,
      outcomeStatus: 'IN_FOSTER',
      outcomeNotes: 'Fostered with Jane Doe until recovered',
    });

    expect(updated.outcomeStatus).toBe('IN_FOSTER');
    expect(updated.outcomeNotes).toContain('Jane Doe');
  });

  it('TC-FR09-01: Setting outcome to ADOPTED requires complete adopter details', async () => {
    const createPet = new CreatePetUseCase(petRepo);
    const setOutcome = new SetPetOutcomeUseCase(petRepo, db);

    const pet = await createPet.execute({
      name: 'Daisy',
      species: 'CANINE',
      breed: 'Poodle',
      sex: 'FEMALE',
      color: 'White',
      dateOfBirth: '2021-08-01',
      intakeOrigin: 'OWNER_SURRENDER',
      isAvailableForAdoption: true,
    });

    // Attempt adoption without adopter details must fail
    await expect(
      setOutcome.execute({
        petId: pet.id,
        outcomeStatus: 'ADOPTED',
      })
    ).rejects.toThrow('[ADOPTION_DETAILS_REQUIRED]');

    // Provide complete adopter details
    const adoptedPet = await setOutcome.execute({
      petId: pet.id,
      outcomeStatus: 'ADOPTED',
      adopterDetails: {
        adopterName: 'John Smith',
        adopterPhone: '+1 555-0123',
        adopterAddress: '742 Evergreen Terrace',
      },
    });

    expect(adoptedPet.outcomeStatus).toBe('ADOPTED');
    expect(adoptedPet.isAvailableForAdoption).toBe(false);

    // Active list should now exclude adopted pet
    const activePets = await petRepo.listActive();
    expect(activePets.length).toBe(0);
  });
});
