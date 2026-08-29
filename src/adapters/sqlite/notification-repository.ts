import { eq, and } from 'drizzle-orm';
import { INotificationRepository, IShelterSession } from '@core/contracts';
import {
  NotificationModel,
  NotificationDeliveryStatus,
  NotificationEscalationModel,
  generateUUIDv7,
} from '@core/domain';
import { notifications, notificationEscalationLogs } from './schema';
import { BaseScopedRepository } from './base-repository';

export class DrizzleNotificationRepository
  extends BaseScopedRepository<NotificationModel>
  implements INotificationRepository
{
  constructor(session: IShelterSession, db: any) {
    super(session, db);
  }

  async createNotification(
    data: Omit<NotificationModel, 'id' | 'shelterId' | 'createdAt'>
  ): Promise<NotificationModel> {
    const id = generateUUIDv7();
    const now = new Date().toISOString();

    const record: NotificationModel = {
      ...data,
      id,
      shelterId: this.activeShelterId,
      createdAt: now,
    };

    this.db.insert(notifications).values(record).run();
    return record;
  }

  async listNotifications(status?: NotificationDeliveryStatus): Promise<NotificationModel[]> {
    let conditions = [eq(notifications.shelterId, this.activeShelterId)];
    if (status) {
      conditions.push(eq(notifications.status, status));
    }
    return this.db.select().from(notifications).where(and(...conditions)).all();
  }

  async getById(id: string): Promise<NotificationModel | null> {
    const rows = this.db
      .select()
      .from(notifications)
      .where(and(eq(notifications.id, id), eq(notifications.shelterId, this.activeShelterId)))
      .all();

    if (rows.length === 0) return null;
    return rows[0];
  }

  async markDelivered(id: string): Promise<void> {
    const now = new Date().toISOString();
    this.db
      .update(notifications)
      .set({
        status: 'DELIVERED',
        deliveredAt: now,
        lastAttemptedAt: now,
      })
      .where(and(eq(notifications.id, id), eq(notifications.shelterId, this.activeShelterId)))
      .run();
  }

  async recordFailure(id: string, reason: string): Promise<{ newStatus: NotificationDeliveryStatus }> {
    const notif = await this.getById(id);
    if (!notif) {
      throw new Error(`Notification ${id} not found.`);
    }

    const newRetryCount = notif.retryCount + 1;
    const now = new Date().toISOString();
    let newStatus: NotificationDeliveryStatus = 'PENDING';

    if (newRetryCount >= notif.maxRetries) {
      newStatus = 'ESCALATED';

      // Insert escalation log
      this.db
        .insert(notificationEscalationLogs)
        .values({
          id: generateUUIDv7(),
          notificationId: notif.id,
          shelterId: this.activeShelterId,
          failureReason: reason,
          isDismissed: false,
          createdAt: now,
          dismissedAt: null,
        })
        .run();
    }

    this.db
      .update(notifications)
      .set({
        retryCount: newRetryCount,
        status: newStatus,
        lastAttemptedAt: now,
      })
      .where(and(eq(notifications.id, id), eq(notifications.shelterId, this.activeShelterId)))
      .run();

    return { newStatus };
  }

  async listActiveEscalations(): Promise<NotificationEscalationModel[]> {
    const rows = this.db
      .select()
      .from(notificationEscalationLogs)
      .where(
        and(
          eq(notificationEscalationLogs.shelterId, this.activeShelterId),
          eq(notificationEscalationLogs.isDismissed, false)
        )
      )
      .all();

    return rows.map((r: any) => ({
      ...r,
      isDismissed: Boolean(r.isDismissed),
    }));
  }

  async dismissEscalation(escalationId: string): Promise<void> {
    const now = new Date().toISOString();
    this.db
      .update(notificationEscalationLogs)
      .set({
        isDismissed: true,
        dismissedAt: now,
      })
      .where(
        and(
          eq(notificationEscalationLogs.id, escalationId),
          eq(notificationEscalationLogs.shelterId, this.activeShelterId)
        )
      )
      .run();
  }
}
