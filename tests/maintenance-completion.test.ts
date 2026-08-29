import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { createTestDatabase, ScopedRepositoryFactory } from '@adapters/sqlite';
import {
  RegisterOperatorUseCase,
  CreateShelterUseCase,
  CreateMaintenanceTaskUseCase,
  CompleteMaintenanceTaskUseCase,
  ListOverdueMaintenanceTasksUseCase,
} from '@core/usecases';

describe('Maintenance Task Notifications & Completion Logging Tests (FR23, TC-FR23-01..02)', () => {
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
    await regOp.execute({ fullName: 'Maintenance Inspector Leo', email: 'leo@maintenance.org' });

    const createShelter = new CreateShelterUseCase(shelterRepo, operatorRepo);
    const shelter = await createShelter.execute({ name: 'Operational Works Facility' });

    session = factory.createSession(shelter.id);
    maintenanceRepo = factory.getMaintenanceRepository(session);
  });

  afterEach(() => {
    sqlite.close();
  });

  it('TC-FR23-01: Marks maintenance task complete with timestamp, operator name, and notes', async () => {
    const createTask = new CreateMaintenanceTaskUseCase(maintenanceRepo);
    const completeTask = new CompleteMaintenanceTaskUseCase(maintenanceRepo);

    const task = await createTask.execute({
      taskType: 'REPAIR',
      description: 'Plumbing leak under sink 2',
      scheduledDate: new Date().toISOString(),
    });

    const completed = await completeTask.execute({
      taskId: task.id,
      operatorName: 'Leo Technician',
      completionNotes: 'Fitted new compression coupling and sealed joint.',
    });

    expect(completed.status).toBe('COMPLETED');
    expect(completed.completedByOperatorName).toBe('Leo Technician');
    expect(completed.completedAt).toBeDefined();
    expect(completed.completionNotes).toContain('compression coupling');

    const fetched = await maintenanceRepo.getById(task.id);
    expect(fetched?.status).toBe('COMPLETED');
  });

  it('TC-FR23-02: Queries overdue maintenance tasks accurately for badge notifications', async () => {
    const createTask = new CreateMaintenanceTaskUseCase(maintenanceRepo);
    const listOverdue = new ListOverdueMaintenanceTasksUseCase(maintenanceRepo);

    // Overdue task (yesterday)
    const yesterday = new Date(Date.now() - 1000 * 60 * 60 * 24).toISOString();
    await createTask.execute({
      taskType: 'CLEANING',
      description: 'Outdoor play run sanitization',
      scheduledDate: yesterday,
    });

    // Future task (next week)
    const nextWeek = new Date(Date.now() + 1000 * 60 * 60 * 24 * 7).toISOString();
    await createTask.execute({
      taskType: 'PREVENTIVE_MAINTENANCE',
      description: 'Fire extinguisher pressure check',
      scheduledDate: nextWeek,
    });

    const overdue = await listOverdue.execute();
    expect(overdue.length).toBe(1);
    expect(overdue[0].description).toBe('Outdoor play run sanitization');
  });
});
