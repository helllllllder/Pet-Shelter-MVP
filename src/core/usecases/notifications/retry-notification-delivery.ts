import { INotificationRepository } from '@core/contracts';
import { NotificationDeliveryStatus } from '@core/domain';

export class RetryNotificationDeliveryUseCase {
  constructor(private readonly notifRepo: INotificationRepository) {}

  async execute(notificationId: string, isSuccessful: boolean, failureReason = 'Delivery timeout'): Promise<{ status: NotificationDeliveryStatus }> {
    if (isSuccessful) {
      await this.notifRepo.markDelivered(notificationId);
      return { status: 'DELIVERED' };
    } else {
      const result = await this.notifRepo.recordFailure(notificationId, failureReason);
      return { status: result.newStatus };
    }
  }
}
