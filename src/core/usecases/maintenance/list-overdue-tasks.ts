import { IMaintenanceRepository } from '@core/contracts';
import { MaintenanceTaskModel } from '@core/domain';

export class ListOverdueMaintenanceTasksUseCase {
  constructor(private readonly maintenanceRepo: IMaintenanceRepository) {}

  async execute(asOfDate?: string): Promise<MaintenanceTaskModel[]> {
    const scheduled = await this.maintenanceRepo.listTasks('SCHEDULED');
    const targetTime = asOfDate ? new Date(asOfDate).getTime() : Date.now();

    return scheduled.filter((task) => new Date(task.scheduledDate).getTime() < targetTime);
  }
}
