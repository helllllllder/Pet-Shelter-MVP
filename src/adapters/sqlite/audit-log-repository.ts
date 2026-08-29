import { eq, and, desc } from 'drizzle-orm';
import { IAuditLogRepository } from '@core/contracts';
import { AuditLogModel, generateUUIDv7 } from '@core/domain';
import { auditLogs } from './schema';

export class DrizzleAuditLogRepository implements IAuditLogRepository {
  constructor(private readonly db: any) {}

  async log(entry: Omit<AuditLogModel, 'id' | 'createdAt'>): Promise<void> {
    const id = generateUUIDv7();
    const now = new Date().toISOString();

    const record = {
      ...entry,
      id,
      createdAt: now,
    };

    this.db.insert(auditLogs).values(record).run();
  }

  async listByEntity(entityType: string, entityId: string): Promise<AuditLogModel[]> {
    const rows = this.db
      .select()
      .from(auditLogs)
      .where(and(eq(auditLogs.entityType, entityType), eq(auditLogs.entityId, entityId)))
      .orderBy(desc(auditLogs.createdAt), desc(auditLogs.id))
      .all();

    return rows;
  }

  async listAll(): Promise<AuditLogModel[]> {
    return this.db.select().from(auditLogs).orderBy(desc(auditLogs.createdAt), desc(auditLogs.id)).all();
  }

  async tombstoneActor(actorIdentifier: string): Promise<number> {
    const result = this.db
      .update(auditLogs)
      .set({
        actorName: '[GDPR ERASURE VERIFIED]',
        actorContact: '[GDPR ERASURE VERIFIED]',
      })
      .where(eq(auditLogs.actorName, actorIdentifier))
      .run();

    return result.changes || 0;
  }
}
