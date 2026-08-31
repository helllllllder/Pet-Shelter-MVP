import type { AuditLog } from "../domain/models.js";

export interface IAuditLogRepository {
  /**
   * Appends an immutable audit log entry.
   */
  append(log: Omit<AuditLog, "id" | "createdAt">): Promise<AuditLog>;

  /**
   * Lists chronological audit log entries for a shelter.
   */
  listByShelter(shelterId: string, limit?: number): Promise<AuditLog[]>;

  /**
   * Lists audit logs for a specific entity ID.
   */
  listByEntity(entityType: string, entityId: string): Promise<AuditLog[]>;
}
