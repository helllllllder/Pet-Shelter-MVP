import { DrizzleAuditLogRepository } from '@adapters/sqlite';

export class ExecuteGdprErasureUseCase {
  constructor(private readonly auditRepo: DrizzleAuditLogRepository) {}

  async execute(targetActorName: string): Promise<{ recordsTombstoned: number }> {
    if (!targetActorName || targetActorName.trim() === '') {
      throw new Error('[GDPR_ERASURE_ERROR] Target actor identifier must be provided.');
    }

    const changes = await this.auditRepo.tombstoneActor(targetActorName.trim());

    // Record an audit log for the GDPR erasure action itself
    await this.auditRepo.log({
      shelterId: null,
      entityType: 'OPERATOR',
      entityId: 'SYSTEM',
      action: 'GDPR_ERASURE',
      actorName: '[GDPR ERASURE VERIFIED]',
      actorContact: '[GDPR ERASURE VERIFIED]',
      payloadDiffJson: JSON.stringify({ action: 'PII_TOMBSTONED', count: changes }),
      ipOrDeviceId: 'LOCAL_SYSTEM',
    });

    return { recordsTombstoned: changes };
  }
}
