import { IMaintenanceRepository } from '@core/contracts';
import { MaintenanceTaskModel, MaintenanceTaskType, RecurrenceUnit } from '@core/domain';
import { MaintenanceTaskSchema } from '@core/schemas';
import { generateUUIDv7 } from '@core/domain';

export interface CreateMaintenanceTaskInput {
  taskType: MaintenanceTaskType;
  description: string;
  scheduledDate: string; // ISO-8601 UTC
  recurrenceIntervalUnit?: RecurrenceUnit;
  recurrenceIntervalValue?: number;
  assignedToName?: string | null;
}

export class CreateMaintenanceTaskUseCase {
  constructor(private readonly maintenanceRepo: IMaintenanceRepository) {}

  async execute(input: CreateMaintenanceTaskInput): Promise<MaintenanceTaskModel> {
    const id = generateUUIDv7();
    const candidate = {
      id,
      shelterId: generateUUIDv7(), // Temporary placeholder for validation
      taskType: input.taskType,
      description: input.description?.trim() || '',
      scheduledDate: input.scheduledDate,
      recurrenceIntervalUnit: input.recurrenceIntervalUnit || 'NONE',
      recurrenceIntervalValue: input.recurrenceIntervalValue || 0,
      assignedToName: input.assignedToName ? input.assignedToName.trim() : null,
      status: 'SCHEDULED' as const,
      completedAt: null,
      completedByOperatorName: null,
      completionNotes: null,
    };

    MaintenanceTaskSchema.parse(candidate);

    return this.maintenanceRepo.createTask({
      taskType: candidate.taskType,
      description: candidate.description,
      scheduledDate: candidate.scheduledDate,
      recurrenceIntervalUnit: candidate.recurrenceIntervalUnit,
      recurrenceIntervalValue: candidate.recurrenceIntervalValue,
      assignedToName: candidate.assignedToName,
      status: 'SCHEDULED',
      completedAt: null,
      completedByOperatorName: null,
      completionNotes: null,
    });
  }
}
