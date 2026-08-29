import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { createTestDatabase, ScopedRepositoryFactory } from '@adapters/sqlite';
import {
  RegisterOperatorUseCase,
  CreateShelterUseCase,
  CreateInventoryItemUseCase,
  AdjustInventoryQuantityUseCase,
} from '@core/usecases';

describe('Categorized Inventory Management Core Tests (FR19, TC-FR19-01..02)', () => {
  let db: any;
  let sqlite: any;
  let factory: ScopedRepositoryFactory;
  let session: any;
  let inventoryRepo: any;

  beforeEach(async () => {
    const instance = createTestDatabase(true);
    db = instance.db;
    sqlite = instance.sqlite;
    factory = new ScopedRepositoryFactory(db);

    const operatorRepo = factory.getOperatorRepository();
    const shelterRepo = factory.getShelterRepository();

    const regOp = new RegisterOperatorUseCase(operatorRepo);
    await regOp.execute({ fullName: 'Supply Manager Dan', email: 'dan@petinventory.org' });

    const createShelter = new CreateShelterUseCase(shelterRepo, operatorRepo);
    const shelter = await createShelter.execute({ name: 'Central Logistics Shelter' });

    session = factory.createSession(shelter.id);
    inventoryRepo = factory.getInventoryRepository(session);
  });

  afterEach(() => {
    sqlite.close();
  });

  it('TC-FR19-01: Creates inventory items across categories with units of measure', async () => {
    const createItem = new CreateInventoryItemUseCase(inventoryRepo);

    // Food
    const food = await createItem.execute({
      name: 'Puppy Dry Food',
      category: 'FOOD',
      quantity: 100,
      unitOfMeasure: 'KG',
      purchaseDate: '2026-08-10',
      expirationDate: '2027-08-10',
      description: 'High protein puppy blend',
    });

    // Medication
    const med = await createItem.execute({
      name: 'Amoxicillin Drops',
      category: 'MEDICATION',
      quantity: 250,
      unitOfMeasure: 'ML',
      expirationDate: '2027-01-01',
    });

    // Cleaning Supplies
    const clean = await createItem.execute({
      name: 'Disinfectant Spray',
      category: 'CLEANING_SUPPLIES',
      quantity: 12,
      unitOfMeasure: 'L',
    });

    expect(food.id).toBeDefined();
    expect(food.category).toBe('FOOD');
    expect(med.unitOfMeasure).toBe('ML');
    expect(clean.unitOfMeasure).toBe('L');

    const foodList = await inventoryRepo.listByCategory('FOOD');
    expect(foodList.length).toBe(1);
    expect(foodList[0].name).toBe('Puppy Dry Food');

    const allItems = await inventoryRepo.listByCategory();
    expect(allItems.length).toBe(3);
  });

  it('TC-FR19-02: Manually adjusts item quantity and rejects negative values', async () => {
    const createItem = new CreateInventoryItemUseCase(inventoryRepo);
    const adjustQty = new AdjustInventoryQuantityUseCase(inventoryRepo);

    const item = await createItem.execute({
      name: 'Cat Litter',
      category: 'OTHER',
      quantity: 50,
      unitOfMeasure: 'KG',
    });

    const updated = await adjustQty.execute(item.id, 45.5);
    expect(updated.quantity).toBe(45.5);

    const fetched = await inventoryRepo.getById(item.id);
    expect(fetched?.quantity).toBe(45.5);

    // Negative quantity rejected
    await expect(adjustQty.execute(item.id, -5)).rejects.toThrow('[INVALID_QUANTITY]');
  });
});
