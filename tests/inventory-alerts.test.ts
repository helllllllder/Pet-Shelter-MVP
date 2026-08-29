import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { createTestDatabase, ScopedRepositoryFactory } from '@adapters/sqlite';
import {
  RegisterOperatorUseCase,
  CreateShelterUseCase,
  CreateInventoryItemUseCase,
  AdjustInventoryQuantityUseCase,
  CreateAlertRuleUseCase,
  EvaluateInventoryAlertsUseCase,
} from '@core/usecases';

describe('Configurable Inventory Alert Rules Engine Tests (FR20, TC-FR20-01..02)', () => {
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
    await regOp.execute({ fullName: 'Auditor Emma', email: 'emma@alerts.org' });

    const createShelter = new CreateShelterUseCase(shelterRepo, operatorRepo);
    const shelter = await createShelter.execute({ name: 'Alerts Evaluation Hub' });

    session = factory.createSession(shelter.id);
    inventoryRepo = factory.getInventoryRepository(session);
  });

  afterEach(() => {
    sqlite.close();
  });

  it('TC-FR20-01: Low stock threshold rule triggers alert when quantity drops', async () => {
    const createItem = new CreateInventoryItemUseCase(inventoryRepo);
    const adjustQty = new AdjustInventoryQuantityUseCase(inventoryRepo);
    const createRule = new CreateAlertRuleUseCase(inventoryRepo);
    const evalAlerts = new EvaluateInventoryAlertsUseCase(inventoryRepo);

    const item = await createItem.execute({
      name: 'Surgical Gauze Rolls',
      category: 'EQUIPMENT',
      quantity: 50,
      unitOfMeasure: 'UNITS',
    });

    // Create threshold rule at 10 units
    await createRule.execute({
      inventoryItemId: item.id,
      triggerType: 'LOW_STOCK_THRESHOLD',
      thresholdValue: 10,
    });

    // Currently 50 units -> 0 alerts
    let activeAlerts = await evalAlerts.execute();
    expect(activeAlerts.length).toBe(0);

    // Consume stock down to 8 units
    await adjustQty.execute(item.id, 8);

    activeAlerts = await evalAlerts.execute();
    expect(activeAlerts.length).toBe(1);
    expect(activeAlerts[0].item.name).toBe('Surgical Gauze Rolls');
    expect(activeAlerts[0].reason).toContain('Low Stock');
  });

  it('TC-FR20-02: Expiration window rule triggers alert when item nears expiration date', async () => {
    const createItem = new CreateInventoryItemUseCase(inventoryRepo);
    const createRule = new CreateAlertRuleUseCase(inventoryRepo);
    const evalAlerts = new EvaluateInventoryAlertsUseCase(inventoryRepo);

    // Item expiring in 15 days
    const futureDate = new Date(Date.now() + 1000 * 60 * 60 * 24 * 15).toISOString().split('T')[0];

    const medItem = await createItem.execute({
      name: 'Rabies Vaccine Batch B',
      category: 'MEDICATION',
      quantity: 30,
      unitOfMeasure: 'UNITS',
      expirationDate: futureDate,
    });

    // Create 30-day expiration window rule
    await createRule.execute({
      inventoryItemId: medItem.id,
      triggerType: 'EXPIRATION_WINDOW',
      daysBeforeExpiration: 30,
    });

    const alerts = await evalAlerts.execute();
    expect(alerts.length).toBe(1);
    expect(alerts[0].item.name).toBe('Rabies Vaccine Batch B');
    expect(alerts[0].reason).toContain('Expiration Warning');
  });
});
