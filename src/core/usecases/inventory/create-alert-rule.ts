import { IInventoryRepository } from '@core/contracts';
import { InventoryAlertRuleModel, InventoryAlertTriggerType } from '@core/domain';
import { InventoryAlertRuleSchema } from '@core/schemas';
import { generateUUIDv7 } from '@core/domain';

export interface CreateAlertRuleInput {
  inventoryItemId: string;
  triggerType: InventoryAlertTriggerType;
  thresholdValue?: number | null;
  daysBeforeExpiration?: number | null;
}

export class CreateAlertRuleUseCase {
  constructor(private readonly inventoryRepo: IInventoryRepository) {}

  async execute(input: CreateAlertRuleInput): Promise<InventoryAlertRuleModel> {
    const item = await this.inventoryRepo.getById(input.inventoryItemId);
    if (!item) {
      throw new Error(`Inventory item with id ${input.inventoryItemId} not found.`);
    }

    const candidate = {
      id: generateUUIDv7(),
      shelterId: generateUUIDv7(), // Temporary placeholder for validation
      inventoryItemId: input.inventoryItemId,
      triggerType: input.triggerType,
      thresholdValue: input.thresholdValue ?? null,
      daysBeforeExpiration: input.daysBeforeExpiration ?? null,
      isActive: true,
    };

    InventoryAlertRuleSchema.parse(candidate);

    return this.inventoryRepo.createAlertRule({
      inventoryItemId: candidate.inventoryItemId,
      triggerType: candidate.triggerType,
      thresholdValue: candidate.thresholdValue,
      daysBeforeExpiration: candidate.daysBeforeExpiration,
      isActive: true,
    });
  }
}
