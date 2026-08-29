import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { createTestDatabase, ScopedRepositoryFactory } from '@adapters/sqlite';
import {
  RegisterOperatorUseCase,
  CreateShelterUseCase,
  CreateMaintenanceTaskUseCase,
} from '@core/usecases';

describe('Maintenance Task Creation, Scheduling & Recurrence Tests (FR22, TC-FR22-01..02)', () => {
  let db: any;
  let sqlite: any;
  let factory: ScopedRepositoryFactory;
  let session: any;
  let maintenanceRepo: any;

  beforeEach(async () => {
    const instance = createTestDatabase(true);
    db = instance.db;
    sqlite = instance.sqlite;
    factory = new ScopedRepositoryFactory(db);

    const operatorRepo = factory.getOperatorRepository();
    const shelterRepo = factory.getShelterRepository();

    const regOp = new RegisterOperatorUseCase(operatorRepo);
    await regOp.execute({ fullName: 'Facility Lead Greg', email: 'greg@facilities.org' });

    const createShelter = new CreateShelterUseCase(shelterRepo, operatorRepo);
    const shelter = await createShelter.execute({ name: 'Shelter Facilities Base' });

    session = factory.createSession(shelter.id);
    maintenanceRepo = factory.getMaintenanceRepository(session);
  });

  afterEach(() => {
    sqlite.close();
  });

  it('TC-FR22-01: Creates maintenance tasks across all 3 task types', async () => {
    const createTask = new CreateMaintenanceTaskUseCase(maintenanceRepo);

    const repair = await createTask.execute({
      taskType: 'REPAIR',
      description: 'Kennel 4 door latch replacement',
      scheduledDate: '2026-09-01T10:00:00.000Z',
      assignedToName: 'Dave Contractor',
    });

    const cleaning = await createTask.execute({
      taskType: 'CLEANING',
      description: 'Isolation ward deep disinfection',
      scheduledDate: '2026-09-02T08:00:00.000Z',
    });

    const prev = await createTask.execute({
      taskType: 'PREVENTIVE_MAINTENANCE',
      description: 'Water filtration cartridge inspection',
      scheduledDate: '2026-09-05T14:00:00.000Z',
    });

    expect(repair.id).toBeDefined();
    expect(repair.taskType).toBe('REPAIR');
    expect(cleaning.taskType).toBe('CLEANING');
    expect(prev.taskType).toBe('PREVENTIVE_MAINTENANCE');

    const tasks = await maintenanceRepo.listTasks();
    expect(tasks.length).toBe(3);
  });

  it('TC-FR22-02: Schedules recurring maintenance task with interval specification', async () => {
    const createTask = new CreateMaintenanceTaskUseCase(maintenanceRepo);

    const recurringTask = await createTask.execute({
      taskType: 'PREVENTIVE_MAINTENANCE',
      description: 'Generator load test',
      scheduledDate: '2026-09-10T09:00:00.000Z',
      recurrenceIntervalUnit: 'MONTHS',
      recurrenceIntervalValue: 1,
      assignedToName: 'Greg Facility Lead',
    });

    expect(recurringTask.recurrenceIntervalUnit).toBe('MONTHS');
    expect(recurringTask.recurrenceIntervalValue).toBe(1);
    expect(recurringTask.status).toBe('SCHEDULED');
  });
});
