import { IInventoryRepository } from '@core/contracts';
import { InventoryItemModel } from '@core/domain';

export class AdjustInventoryQuantityUseCase {
  constructor(private readonly inventoryRepo: IInventoryRepository) {}

  async execute(itemId: string, newQuantity: number): Promise<InventoryItemModel> {
    return this.inventoryRepo.updateQuantity(itemId, newQuantity);
  }
}
