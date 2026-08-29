import { IInventoryRepository } from '@core/contracts';
import { InventoryUsageTemplateModel } from '@core/domain';

export interface CreateUsageTemplateInput {
  name: string;
  description?: string | null;
  items: {
    inventoryItemId: string;
    quantityToDecrement: number;
  }[];
}

export class CreateUsageTemplateUseCase {
  constructor(private readonly inventoryRepo: IInventoryRepository) {}

  async execute(input: CreateUsageTemplateInput): Promise<InventoryUsageTemplateModel> {
    if (!input.name || input.name.trim() === '') {
      throw new Error('[VALIDATION_ERROR] Usage template name is required.');
    }

    if (!input.items || input.items.length === 0) {
      throw new Error('[VALIDATION_ERROR] Usage template must have at least one item.');
    }

    for (const item of input.items) {
      if (item.quantityToDecrement <= 0) {
        throw new Error('[VALIDATION_ERROR] Item quantity to decrement must be greater than zero.');
      }
      const existingItem = await this.inventoryRepo.getById(item.inventoryItemId);
      if (!existingItem) {
        throw new Error(`Inventory item with id ${item.inventoryItemId} not found.`);
      }
    }

    return this.inventoryRepo.createUsageTemplate(
      input.name.trim(),
      input.description ? input.description.trim() : null,
      input.items
    );
  }
}
