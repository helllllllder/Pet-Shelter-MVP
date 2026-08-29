import { IInventoryRepository } from '@core/contracts';
import { InventoryItemModel, InventoryCategory, UnitOfMeasure } from '@core/domain';
import { InventoryItemSchema } from '@core/schemas';
import { generateUUIDv7 } from '@core/domain';

export interface CreateInventoryItemInput {
  name: string;
  category: InventoryCategory;
  quantity: number;
  unitOfMeasure: UnitOfMeasure;
  purchaseDate?: string | null;
  expirationDate?: string | null;
  description?: string | null;
}

export class CreateInventoryItemUseCase {
  constructor(private readonly inventoryRepo: IInventoryRepository) {}

  async execute(input: CreateInventoryItemInput): Promise<InventoryItemModel> {
    const id = generateUUIDv7();
    const candidate = {
      id,
      shelterId: generateUUIDv7(), // Temporary placeholder for validation
      name: input.name?.trim() || '',
      category: input.category,
      quantity: input.quantity,
      unitOfMeasure: input.unitOfMeasure,
      purchaseDate: input.purchaseDate || null,
      expirationDate: input.expirationDate || null,
      description: input.description ? input.description.trim() : null,
    };

    InventoryItemSchema.parse(candidate);

    return this.inventoryRepo.create({
      name: candidate.name,
      category: candidate.category,
      quantity: candidate.quantity,
      unitOfMeasure: candidate.unitOfMeasure,
      purchaseDate: candidate.purchaseDate,
      expirationDate: candidate.expirationDate,
      description: candidate.description,
    });
  }
}
