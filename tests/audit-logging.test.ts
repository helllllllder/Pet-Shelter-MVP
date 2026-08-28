import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { createTestDatabase, ScopedRepositoryFactory } from '@adapters/sqlite';
import { ExecuteGdprErasureUseCase } from '@core/usecases';

describe('Append-Only Audit Logging & GDPR Tombstoning Tests (NFR13, NFR16)', () => {
  let db: any;
  let sqlite: any;
  let factory: ScopedRepositoryFactory;
  let auditRepo: any;

  beforeEach(() => {
    const instance = createTestDatabase(true);
    db = instance.db;
    sqlite = instance.sqlite;
    factory = new ScopedRepositoryFactory(db);
    auditRepo = factory.getAuditLogRepository();
  });

  afterEach(() => {
    sqlite.close();
  });

  it('NFR13: Appends tamper-evident audit logs and retrieves by entity', async () => {
    await auditRepo.log({
      shelterId: 'shelter-test-01',
      entityType: 'PET',
      entityId: 'pet-test-01',
      action: 'CREATE',
      actorName: 'Alice Operator',
      actorContact: 'alice@shelter.org',
      payloadDiffJson: JSON.stringify({ name: 'Buddy', species: 'CANINE' }),
      ipOrDeviceId: 'device-001',
    });

    await auditRepo.log({
      shelterId: 'shelter-test-01',
      entityType: 'PET',
      entityId: 'pet-test-01',
      action: 'UPDATE',
      actorName: 'Alice Operator',
      actorContact: 'alice@shelter.org',
      payloadDiffJson: JSON.stringify({ outcomeStatus: 'ADOPTED' }),
      ipOrDeviceId: 'device-001',
    });

    const logs = await auditRepo.listByEntity('PET', 'pet-test-01');
    expect(logs.length).toBe(2);
    expect(logs[0].action).toBe('UPDATE'); // Ordered by createdAt desc
    expect(logs[1].action).toBe('CREATE');
  });

  it('NFR16: Replaces actor PII with [GDPR ERASURE VERIFIED] without deleting audit records', async () => {
    await auditRepo.log({
      shelterId: 'shelter-test-01',
      entityType: 'PET',
      entityId: 'pet-123',
      action: 'CREATE',
      actorName: 'John Doe',
      actorContact: 'john.doe@example.com',
      payloadDiffJson: null,
      ipOrDeviceId: 'device-001',
    });

    const erasureUseCase = new ExecuteGdprErasureUseCase(auditRepo);
    const result = await erasureUseCase.execute('John Doe');

    expect(result.recordsTombstoned).toBe(1);

    const allLogs = await auditRepo.listAll();
    // 1 original tombstoned + 1 GDPR_ERASURE audit event
    expect(allLogs.length).toBe(2);

    const tombstoned = allLogs.find((l: any) => l.entityId === 'pet-123');
    expect(tombstoned?.actorName).toBe('[GDPR ERASURE VERIFIED]');
    expect(tombstoned?.actorContact).toBe('[GDPR ERASURE VERIFIED]');
  });
});
