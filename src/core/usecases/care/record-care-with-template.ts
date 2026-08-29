import { ICareEventRepository, IInventoryRepository } from '@core/contracts';
import { CareEventModel } from '@core/domain';
import { ScheduleCareEventInput, ScheduleCareEventUseCase } from './schedule-care-event';

export interface RecordCareWithTemplateInput extends ScheduleCareEventInput {
  inventoryUsageTemplateId?: string | null;
}

export class RecordCareWithTemplateUseCase {
  constructor(
    private readonly careRepo: ICareEventRepository,
    private readonly inventoryRepo: IInventoryRepository
  ) {}

  async execute(input: RecordCareWithTemplateInput): Promise<CareEventModel> {
    const scheduleUseCase = new ScheduleCareEventUseCase(this.careRepo);
    const careEvent = await scheduleUseCase.execute(input);

    if (input.inventoryUsageTemplateId) {
      await this.inventoryRepo.applyUsageTemplate(input.inventoryUsageTemplateId);
    }

    return careEvent;
  }
}
