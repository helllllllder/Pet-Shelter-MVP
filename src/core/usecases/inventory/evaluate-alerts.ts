import { IInventoryRepository } from '@core/contracts';
import { InventoryItemModel, InventoryAlertRuleModel } from '@core/domain';

export interface ActiveInventoryAlert {
  item: InventoryItemModel;
  rule: InventoryAlertRuleModel;
  reason: string;
}

export class EvaluateInventoryAlertsUseCase {
  constructor(private readonly inventoryRepo: IInventoryRepository) {}

  async execute(): Promise<ActiveInventoryAlert[]> {
    return this.inventoryRepo.listActiveAlerts();
  }
}
