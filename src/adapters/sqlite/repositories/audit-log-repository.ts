import type { IAuditLogRepository } from "../../../core/contracts/audit-log-repository.js";
import type { AuditLog } from "../../../core/domain/models.js";
import type { LunaDatabase } from "../database.js";
import * as schema from "../schema.js";
import { and, desc, eq } from "drizzle-orm";
import { generateUUIDv7 } from "../../../core/domain/uuid.js";

export class SqliteAuditLogRepository implements IAuditLogRepository {
  constructor(private readonly db: LunaDatabase) {}

  async append(log: Omit<AuditLog, "id" | "createdAt">): Promise<AuditLog> {
    const id = generateUUIDv7();
    const now = new Date().toISOString();
    const created: AuditLog = {
      ...log,
      id,
      createdAt: now,
    };

    await this.db.insert(schema.auditLogsTable).values({
      id: created.id,
      shelterId: created.shelterId,
      entityType: created.entityType,
      entityId: created.entityId,
      action: created.action,
      actorType: created.actorType,
      actorId: created.actorId,
      details: created.details,
      createdAt: created.createdAt,
    });

    return created;
  }

  async listByShelter(
    shelterId: string,
    limit: number = 50
  ): Promise<AuditLog[]> {
    const rows = await this.db
      .select()
      .from(schema.auditLogsTable)
      .where(eq(schema.auditLogsTable.shelterId, shelterId))
      .orderBy(desc(schema.auditLogsTable.createdAt))
      .limit(limit);

    return rows.map((row) => this.mapAuditLogRow(row));
  }

  async listByEntity(
    entityType: string,
    entityId: string
  ): Promise<AuditLog[]> {
    const rows = await this.db
      .select()
      .from(schema.auditLogsTable)
      .where(
        and(
          eq(schema.auditLogsTable.entityType, entityType),
          eq(schema.auditLogsTable.entityId, entityId)
        )
      )
      .orderBy(desc(schema.auditLogsTable.createdAt));

    return rows.map((row) => this.mapAuditLogRow(row));
  }

  private mapAuditLogRow(
    row: typeof schema.auditLogsTable.$inferSelect
  ): AuditLog {
    return {
      id: row.id,
      shelterId: row.shelterId,
      entityType: row.entityType,
      entityId: row.entityId,
      action: row.action as AuditLog["action"],
      actorType: row.actorType as AuditLog["actorType"],
      actorId: row.actorId,
      details: row.details,
      createdAt: row.createdAt,
    };
  }
}
