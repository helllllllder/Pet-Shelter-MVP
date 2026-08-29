import { NotificationModel, NotificationDeliveryStatus, NotificationEscalationModel } from '../domain';

export interface INotificationRepository {
  createNotification(data: Omit<NotificationModel, 'id' | 'shelterId' | 'createdAt'>): Promise<NotificationModel>;
  listNotifications(status?: NotificationDeliveryStatus): Promise<NotificationModel[]>;
  getById(id: string): Promise<NotificationModel | null>;
  markDelivered(id: string): Promise<void>;
  recordFailure(id: string, reason: string): Promise<{ newStatus: NotificationDeliveryStatus }>;
  listActiveEscalations(): Promise<NotificationEscalationModel[]>;
  dismissEscalation(escalationId: string): Promise<void>;
}
