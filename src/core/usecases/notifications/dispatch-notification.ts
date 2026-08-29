import { INotificationRepository } from '@core/contracts';
import {
  NotificationModel,
  NotificationTier,
  NotificationChannel,
  NotificationDeliveryStatus,
} from '@core/domain';
import { NotificationSchema } from '@core/schemas';
import { generateUUIDv7 } from '@core/domain';

export interface DispatchNotificationInput {
  tier: NotificationTier;
  channel?: NotificationChannel;
  recipientIdentifier: string;
  title: string;
  message: string;
  entityType?: string | null;
  entityId?: string | null;
}

export class DispatchNotificationUseCase {
  constructor(private readonly notifRepo: INotificationRepository) {}

  async execute(input: DispatchNotificationInput): Promise<NotificationModel> {
    const id = generateUUIDv7();
    const now = new Date().toISOString();

    const channel = input.channel || (input.tier === 'STANDARD' ? 'IN_APP' : 'EMAIL');
    const initialStatus = input.tier === 'STANDARD' ? 'DELIVERED' : 'PENDING';

    const candidate = {
      id,
      shelterId: generateUUIDv7(), // Temporary placeholder for validation
      tier: input.tier,
      channel,
      recipientIdentifier: input.recipientIdentifier.trim(),
      title: input.title.trim(),
      message: input.message.trim(),
      entityType: input.entityType ?? null,
      entityId: input.entityId ?? null,
      status: initialStatus as NotificationDeliveryStatus,
      retryCount: 0,
      maxRetries: 3,
      lastAttemptedAt: input.tier === 'STANDARD' ? now : null,
      deliveredAt: input.tier === 'STANDARD' ? now : null,
    };

    NotificationSchema.parse(candidate);

    return this.notifRepo.createNotification({
      tier: candidate.tier,
      channel: candidate.channel,
      recipientIdentifier: candidate.recipientIdentifier,
      title: candidate.title,
      message: candidate.message,
      entityType: candidate.entityType,
      entityId: candidate.entityId,
      status: candidate.status,
      retryCount: candidate.retryCount,
      maxRetries: candidate.maxRetries,
      lastAttemptedAt: candidate.lastAttemptedAt,
      deliveredAt: candidate.deliveredAt,
    });
  }
}
