import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { createTestDatabase, ScopedRepositoryFactory } from '@adapters/sqlite';
import { RegisterOperatorUseCase, CreateShelterUseCase, ScheduleCareEventUseCase } from '@core/usecases';
import { calculateOccurrences } from '@core/domain';

describe('Care Events Recurrence & Due-Date Alert Tests (FR15, FR16, FR17)', () => {
  let db: any;
  let sqlite: any;
  let factory: ScopedRepositoryFactory;
  let session: any;
  let careRepo: any;

  beforeEach(async () => {
    const instance = createTestDatabase(true);
    db = instance.db;
    sqlite = instance.sqlite;
    factory = new ScopedRepositoryFactory(db);

    const operatorRepo = factory.getOperatorRepository();
    const shelterRepo = factory.getShelterRepository();

    const regOp = new RegisterOperatorUseCase(operatorRepo);
    await regOp.execute({ fullName: 'Care Specialist Anna', email: 'anna@petcare.org' });

    const createShelter = new CreateShelterUseCase(shelterRepo, operatorRepo);
    const shelter = await createShelter.execute({ name: 'Wellness Shelter' });

    session = factory.createSession(shelter.id);
    careRepo = factory.getCareEventRepository(session);
    const petRepo = factory.getPetRepository(session);

    const pet = await petRepo.create({
      name: 'Rover',
      species: 'CANINE',
      breed: 'Retriever',
      sex: 'MALE',
      color: 'Gold',
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
    testPetId = pet.id;
  });

  let testPetId: string;

  afterEach(() => {
    sqlite.close();
  });

  it('Calculates recurring occurrences accurately across days/months', () => {
    const occurrences = calculateOccurrences('2026-09-01T08:00:00.000Z', 'MONTHS', 1, 3);
    expect(occurrences.length).toBe(3);
    expect(occurrences[0].dueDate).toContain('2026-09-01');
    expect(occurrences[1].dueDate).toContain('2026-10-01');
    expect(occurrences[2].dueDate).toContain('2026-11-01');
  });

  it('TC-FR15-01: Schedules recurring care event and generates occurrence records', async () => {
    const scheduleUseCase = new ScheduleCareEventUseCase(careRepo);

    const event = await scheduleUseCase.execute({
      petId: testPetId,
      modality: 'VERMIFUGE',
      substanceName: 'Pyrantel Pamoate',
      dosage: '5ml',
      recurrenceIntervalUnit: 'DAYS',
      recurrenceIntervalValue: 14,
      startDate: '2026-09-01T09:00:00.000Z',
    });

    expect(event.id).toBeDefined();
    expect(event.modality).toBe('VERMIFUGE');
    expect(event.recurrenceIntervalValue).toBe(14);

    const dueList = await careRepo.listOccurrencesDue('2026-09-01', '2026-12-31');
    expect(dueList.length).toBeGreaterThanOrEqual(1);
    expect(dueList[0].careEventId).toBe(event.id);
  });

  it('TC-FR17-01: In-app due-date alerts query returns upcoming scheduled events', async () => {
    const scheduleUseCase = new ScheduleCareEventUseCase(careRepo);

    await scheduleUseCase.execute({
      petId: testPetId,
      modality: 'VACCINE',
      substanceName: 'Rabies Annual',
      recurrenceIntervalUnit: 'YEARS',
      recurrenceIntervalValue: 1,
      startDate: '2026-08-28T12:00:00.000Z',
    });

    const dueNow = await careRepo.listOccurrencesDue('2026-08-01', '2026-08-29T23:59:59.000Z');
    expect(dueNow.length).toBe(1);
    expect(dueNow[0].status).toBe('SCHEDULED');
  });
});
