import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { createTestDatabase, ScopedRepositoryFactory } from '@adapters/sqlite';
import {
  RegisterOperatorUseCase,
  CreateShelterUseCase,
  DispatchNotificationUseCase,
  RetryNotificationDeliveryUseCase,
  DismissNotificationEscalationUseCase,
} from '@core/usecases';

describe('Notification 3-Retry Policy & In-App Banner Escalation Tests (FR25, ADR 0004, TC-FR25-01..02)', () => {
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
    await regOp.execute({ fullName: 'Reliability Engineer Maya', email: 'maya@reliability.org' });

    const createShelter = new CreateShelterUseCase(shelterRepo, operatorRepo);
    const shelter = await createShelter.execute({ name: 'Reliable Comms Hub' });

    session = factory.createSession(shelter.id);
    notifRepo = factory.getNotificationRepository(session);
  });

  afterEach(() => {
    sqlite.close();
  });

  it('TC-FR25-01: Escalates to in-app banner after 3 failed delivery retries', async () => {
    const dispatch = new DispatchNotificationUseCase(notifRepo);
    const retryUseCase = new RetryNotificationDeliveryUseCase(notifRepo);

    const customNotif = await dispatch.execute({
      tier: 'CUSTOM',
      channel: 'EMAIL',
      recipientIdentifier: 'director@external.org',
      title: 'Urgent Care Warning',
      message: 'Pet hospitalization update failed to send.',
    });

    expect(customNotif.status).toBe('PENDING');

    // Retry Attempt 1 -> Failure
    const attempt1 = await retryUseCase.execute(customNotif.id, false, 'SMTP Connection Timeout');
    expect(attempt1.status).toBe('PENDING');

    // Retry Attempt 2 -> Failure
    const attempt2 = await retryUseCase.execute(customNotif.id, false, '503 Service Unavailable');
    expect(attempt2.status).toBe('PENDING');

    // Retry Attempt 3 -> Persistent Failure triggers ESCALATED
    const attempt3 = await retryUseCase.execute(customNotif.id, false, 'Permanent DNS Resolution Error');
    expect(attempt3.status).toBe('ESCALATED');

    const activeEscalations = await notifRepo.listActiveEscalations();
    expect(activeEscalations.length).toBe(1);
    expect(activeEscalations[0].notificationId).toBe(customNotif.id);
    expect(activeEscalations[0].failureReason).toContain('Permanent DNS');
  });

  it('TC-FR25-02: Allows operator to dismiss active escalation banner', async () => {
    const dispatch = new DispatchNotificationUseCase(notifRepo);
    const retryUseCase = new RetryNotificationDeliveryUseCase(notifRepo);
    const dismissUseCase = new DismissNotificationEscalationUseCase(notifRepo);

    const notif = await dispatch.execute({
      tier: 'CUSTOM',
      channel: 'PUSH',
      recipientIdentifier: 'device-token-abc',
      title: 'Push Alert',
      message: 'Failed message',
    });

    // Exhaust 3 retries
    await retryUseCase.execute(notif.id, false, 'FCM error 1');
    await retryUseCase.execute(notif.id, false, 'FCM error 2');
    await retryUseCase.execute(notif.id, false, 'FCM error 3');

    let escalations = await notifRepo.listActiveEscalations();
    expect(escalations.length).toBe(1);

    // Operator dismisses banner
    await dismissUseCase.execute(escalations[0].id);

    escalations = await notifRepo.listActiveEscalations();
    expect(escalations.length).toBe(0);
  });
});
