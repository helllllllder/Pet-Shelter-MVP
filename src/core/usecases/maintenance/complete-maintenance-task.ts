import { IMaintenanceRepository } from '@core/contracts';
import { MaintenanceTaskModel } from '@core/domain';

export interface CompleteMaintenanceTaskInput {
  taskId: string;
  operatorName: string;
  completionNotes?: string | null;
}

export class CompleteMaintenanceTaskUseCase {
  constructor(private readonly maintenanceRepo: IMaintenanceRepository) {}

  async execute(input: CompleteMaintenanceTaskInput): Promise<MaintenanceTaskModel> {
    if (!input.operatorName || input.operatorName.trim() === '') {
      throw new Error('[VALIDATION_ERROR] Operator name is required when completing a maintenance task.');
    }

    return this.maintenanceRepo.markCompleted(
      input.taskId,
      input.operatorName.trim(),
      input.completionNotes ? input.completionNotes.trim() : null
    );
  }
}
