import { INotificationRepository } from '@core/contracts';

export class DismissNotificationEscalationUseCase {
  constructor(private readonly notifRepo: INotificationRepository) {}

  async execute(escalationId: string): Promise<void> {
    return this.notifRepo.dismissEscalation(escalationId);
  }
}
