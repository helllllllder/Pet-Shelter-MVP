import { eq, and, isNull } from 'drizzle-orm';
import { IMaintenanceRepository, IShelterSession } from '@core/contracts';
import { MaintenanceTaskModel, MaintenanceStatus, generateUUIDv7 } from '@core/domain';
import { maintenanceTasks } from './schema';
import { BaseScopedRepository } from './base-repository';

export class DrizzleMaintenanceRepository
  extends BaseScopedRepository<MaintenanceTaskModel>
  implements IMaintenanceRepository
{
  constructor(session: IShelterSession, db: any) {
    super(session, db);
  }

  async getById(id: string): Promise<MaintenanceTaskModel | null> {
    const rows = this.db
      .select()
      .from(maintenanceTasks)
      .where(
        and(
          eq(maintenanceTasks.id, id),
          eq(maintenanceTasks.shelterId, this.activeShelterId),
          isNull(maintenanceTasks.deletedAt)
        )
      )
      .all();

    if (rows.length === 0) return null;
    return rows[0];
  }

  async listTasks(status?: MaintenanceStatus): Promise<MaintenanceTaskModel[]> {
    let conditions = [
      eq(maintenanceTasks.shelterId, this.activeShelterId),
      isNull(maintenanceTasks.deletedAt),
    ];

    if (status) {
      conditions.push(eq(maintenanceTasks.status, status));
    }

    return this.db
      .select()
      .from(maintenanceTasks)
      .where(and(...conditions))
      .all();
  }

  async createTask(
    data: Omit<MaintenanceTaskModel, 'id' | 'shelterId' | 'createdAt' | 'updatedAt' | 'deletedAt'>
  ): Promise<MaintenanceTaskModel> {
    const id = generateUUIDv7();
    const now = new Date().toISOString();

    const record: MaintenanceTaskModel = {
      ...data,
      id,
      shelterId: this.activeShelterId,
      createdAt: now,
      updatedAt: now,
      deletedAt: null,
    };

    this.db.insert(maintenanceTasks).values(record).run();
    return record;
  }

  async markCompleted(
    id: string,
    operatorName: string,
    notes?: string | null
  ): Promise<MaintenanceTaskModel> {
    const existing = await this.getById(id);
    if (!existing) {
      throw new Error(`Maintenance task with id ${id} not found.`);
    }

    const now = new Date().toISOString();
    this.db
      .update(maintenanceTasks)
      .set({
        status: 'COMPLETED',
        completedAt: now,
        completedByOperatorName: operatorName,
        completionNotes: notes ? notes.trim() : null,
        updatedAt: now,
      })
      .where(and(eq(maintenanceTasks.id, id), eq(maintenanceTasks.shelterId, this.activeShelterId)))
      .run();

    return {
      ...existing,
      status: 'COMPLETED',
      completedAt: now,
      completedByOperatorName: operatorName,
      completionNotes: notes ? notes.trim() : null,
      updatedAt: now,
    };
  }

  async softDelete(id: string): Promise<void> {
    const now = new Date().toISOString();
    this.db
      .update(maintenanceTasks)
      .set({ deletedAt: now, updatedAt: now })
      .where(and(eq(maintenanceTasks.id, id), eq(maintenanceTasks.shelterId, this.activeShelterId)))
      .run();
  }
}
