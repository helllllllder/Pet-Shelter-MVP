import { IInventoryRepository } from '@core/contracts';

export class ApplyUsageTemplateUseCase {
  constructor(private readonly inventoryRepo: IInventoryRepository) {}

  async execute(templateId: string): Promise<void> {
    return this.inventoryRepo.applyUsageTemplate(templateId);
  }
}
