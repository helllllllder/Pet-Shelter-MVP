import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { createTestDatabase, ScopedRepositoryFactory } from '@adapters/sqlite';
import {
  RegisterOperatorUseCase,
  CreateShelterUseCase,
  DispatchNotificationUseCase,
} from '@core/usecases';

describe('Two-Tier Notification Delivery System Tests (FR24, NFR05, TC-FR24-01..02)', () => {
  let db: any;
  let sqlite: any;
  let factory: ScopedRepositoryFactory;
  let session: any;
  let notifRepo: any;

  beforeEach(async () => {
    const instance = createTestDatabase(true);
    db = instance.db;
    sqlite = instance.sqlite;
    factory = new ScopedRepositoryFactory(db);

    const operatorRepo = factory.getOperatorRepository();
    const shelterRepo = factory.getShelterRepository();

    const regOp = new RegisterOperatorUseCase(operatorRepo);
    await regOp.execute({ fullName: 'Dispatcher Chloe', email: 'chloe@notifications.org' });

    const createShelter = new CreateShelterUseCase(shelterRepo, operatorRepo);
    const shelter = await createShelter.execute({ name: 'Comms Control Center' });

    session = factory.createSession(shelter.id);
    notifRepo = factory.getNotificationRepository(session);
  });

  afterEach(() => {
    sqlite.close();
  });

  it('TC-FR24-01: Standard Tier in-app notifications are delivered immediately (<5s)', async () => {
    const dispatch = new DispatchNotificationUseCase(notifRepo);

    const notif = await dispatch.execute({
      tier: 'STANDARD',
      channel: 'IN_APP',
      recipientIdentifier: 'local-operator',
      title: 'Care Event Due',
      message: 'Rabies vaccine for Buddy is due today.',
    });

    expect(notif.id).toBeDefined();
    expect(notif.tier).toBe('STANDARD');
    expect(notif.status).toBe('DELIVERED');
    expect(notif.deliveredAt).toBeDefined();

    const deliveredList = await notifRepo.listNotifications('DELIVERED');
    expect(deliveredList.length).toBe(1);
  });

  it('TC-FR24-02: Custom Tier notifications route with PENDING status for external channels', async () => {
    const dispatch = new DispatchNotificationUseCase(notifRepo);

    const customNotif = await dispatch.execute({
      tier: 'CUSTOM',
      channel: 'EMAIL',
      recipientIdentifier: 'director@shelter.org',
      title: 'Emergency Inventory Alert',
      message: 'Critical medication inventory depleted.',
    });

    expect(customNotif.tier).toBe('CUSTOM');
    expect(customNotif.channel).toBe('EMAIL');
    expect(customNotif.status).toBe('PENDING');

    const pendingList = await notifRepo.listNotifications('PENDING');
    expect(pendingList.length).toBe(1);
  });
});
