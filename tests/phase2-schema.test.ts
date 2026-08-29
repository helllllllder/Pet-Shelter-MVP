import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { createTestDatabase } from '@adapters/sqlite';
import { inventoryItems, inventoryAlertRules, inventoryUsageTemplates, inventoryUsageTemplateItems, maintenanceTasks, notifications, notificationEscalationLogs, shelters } from '@adapters/sqlite/schema';
import { generateUUIDv7 } from '@core/domain';
import { eq } from 'drizzle-orm';

describe('Phase 2 SQLite Schema & Drizzle Migration Tests (#12)', () => {
  let db: any;
  let sqlite: any;
  let shelterId: string;

  beforeEach(() => {
    const instance = createTestDatabase(true);
    db = instance.db;
    sqlite = instance.sqlite;

    shelterId = generateUUIDv7();
    db.insert(shelters).values({
      id: shelterId,
      name: 'Inventory & Maintenance Test Shelter',
      description: null,
      address: null,
      phone: null,
      email: null,
      isActive: true,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    }).run();
  });

  afterEach(() => {
    sqlite.close();
  });

  it('Creates inventory items and alert rules with cascade deletion', () => {
    const itemId = generateUUIDv7();
    const now = new Date().toISOString();

    db.insert(inventoryItems).values({
      id: itemId,
      shelterId,
      name: 'Dry Dog Food (Adult)',
      category: 'FOOD',
      quantity: 50.5,
      unitOfMeasure: 'KG',
      purchaseDate: '2026-08-01',
      expirationDate: '2027-08-01',
      description: 'Premium Kibble',
      createdAt: now,
      updatedAt: now,
    }).run();

    const ruleId = generateUUIDv7();
    db.insert(inventoryAlertRules).values({
      id: ruleId,
      shelterId,
      inventoryItemId: itemId,
      triggerType: 'LOW_STOCK_THRESHOLD',
      thresholdValue: 10.0,
      daysBeforeExpiration: null,
      isActive: true,
      createdAt: now,
      updatedAt: now,
    }).run();

    const items = db.select().from(inventoryItems).where(eq(inventoryItems.id, itemId)).all();
    expect(items.length).toBe(1);
    expect(items[0].name).toBe('Dry Dog Food (Adult)');
    expect(items[0].quantity).toBe(50.5);

    const rules = db.select().from(inventoryAlertRules).where(eq(inventoryAlertRules.id, ruleId)).all();
    expect(rules.length).toBe(1);
    expect(rules[0].thresholdValue).toBe(10.0);

    // Deleting item cascades to alert rule
    db.delete(inventoryItems).where(eq(inventoryItems.id, itemId)).run();
    const remainingRules = db.select().from(inventoryAlertRules).where(eq(inventoryAlertRules.id, ruleId)).all();
    expect(remainingRules.length).toBe(0);
  });

  it('Creates maintenance tasks and notifications with status indexes', () => {
    const taskId = generateUUIDv7();
    const notifId = generateUUIDv7();
    const now = new Date().toISOString();

    db.insert(maintenanceTasks).values({
      id: taskId,
      shelterId,
      taskType: 'PREVENTIVE_MAINTENANCE',
      description: 'HVAC Air Filter Replacement',
      scheduledDate: now,
      recurrenceIntervalUnit: 'MONTHS',
      recurrenceIntervalValue: 3,
      assignedToName: 'Bob Technician',
      status: 'SCHEDULED',
      createdAt: now,
      updatedAt: now,
    }).run();

    db.insert(notifications).values({
      id: notifId,
      shelterId,
      tier: 'STANDARD',
      channel: 'IN_APP',
      recipientIdentifier: 'all-staff',
      title: 'Maintenance Due',
      message: 'HVAC Air Filter Replacement is due today.',
      status: 'PENDING',
      retryCount: 0,
      maxRetries: 3,
      createdAt: now,
    }).run();

    const tasks = db.select().from(maintenanceTasks).where(eq(maintenanceTasks.id, taskId)).all();
    expect(tasks.length).toBe(1);
    expect(tasks[0].taskType).toBe('PREVENTIVE_MAINTENANCE');

    const notifs = db.select().from(notifications).where(eq(notifications.id, notifId)).all();
    expect(notifs.length).toBe(1);
    expect(notifs[0].status).toBe('PENDING');
  });
});
