import { eq, and, isNull } from 'drizzle-orm';
import { IInventoryRepository, IShelterSession } from '@core/contracts';
import {
  InventoryItemModel,
  InventoryCategory,
  InventoryAlertRuleModel,
  InventoryUsageTemplateModel,
  generateUUIDv7,
} from '@core/domain';
import {
  inventoryItems,
  inventoryAlertRules,
  inventoryUsageTemplates,
  inventoryUsageTemplateItems,
} from './schema';
import { BaseScopedRepository } from './base-repository';

export class DrizzleInventoryRepository
  extends BaseScopedRepository<InventoryItemModel>
  implements IInventoryRepository
{
  constructor(session: IShelterSession, db: any) {
    super(session, db);
  }

  async getById(id: string): Promise<InventoryItemModel | null> {
    const rows = this.db
      .select()
      .from(inventoryItems)
      .where(
        and(
          eq(inventoryItems.id, id),
          eq(inventoryItems.shelterId, this.activeShelterId),
          isNull(inventoryItems.deletedAt)
        )
      )
      .all();

    if (rows.length === 0) return null;
    return rows[0];
  }

  async listByCategory(category?: InventoryCategory): Promise<InventoryItemModel[]> {
    let conditions = [
      eq(inventoryItems.shelterId, this.activeShelterId),
      isNull(inventoryItems.deletedAt),
    ];

    if (category) {
      conditions.push(eq(inventoryItems.category, category));
    }

    return this.db
      .select()
      .from(inventoryItems)
      .where(and(...conditions))
      .all();
  }

  async create(
    data: Omit<InventoryItemModel, 'id' | 'shelterId' | 'createdAt' | 'updatedAt' | 'deletedAt'>
  ): Promise<InventoryItemModel> {
    const id = generateUUIDv7();
    const now = new Date().toISOString();

    const record: InventoryItemModel = {
      ...data,
      id,
      shelterId: this.activeShelterId,
      createdAt: now,
      updatedAt: now,
      deletedAt: null,
    };

    this.db.insert(inventoryItems).values(record).run();
    return record;
  }

  async updateQuantity(id: string, newQuantity: number): Promise<InventoryItemModel> {
    const existing = await this.getById(id);
    if (!existing) {
      throw new Error(`Inventory item with id ${id} not found.`);
    }

    if (newQuantity < 0) {
      throw new Error('[INVALID_QUANTITY] Inventory quantity cannot be negative.');
    }

    const now = new Date().toISOString();
    this.db
      .update(inventoryItems)
      .set({ quantity: newQuantity, updatedAt: now })
      .where(and(eq(inventoryItems.id, id), eq(inventoryItems.shelterId, this.activeShelterId)))
      .run();

    return {
      ...existing,
      quantity: newQuantity,
      updatedAt: now,
    };
  }

  async softDelete(id: string): Promise<void> {
    const now = new Date().toISOString();
    this.db
      .update(inventoryItems)
      .set({ deletedAt: now, updatedAt: now })
      .where(and(eq(inventoryItems.id, id), eq(inventoryItems.shelterId, this.activeShelterId)))
      .run();
  }

  async createAlertRule(
    rule: Omit<InventoryAlertRuleModel, 'id' | 'shelterId' | 'createdAt' | 'updatedAt'>
  ): Promise<InventoryAlertRuleModel> {
    const id = generateUUIDv7();
    const now = new Date().toISOString();

    const record = {
      ...rule,
      id,
      shelterId: this.activeShelterId,
      isActive: Boolean(rule.isActive),
      createdAt: now,
      updatedAt: now,
    };

    this.db.insert(inventoryAlertRules).values(record).run();
    return record;
  }

  async listActiveAlerts(): Promise<{ item: InventoryItemModel; rule: InventoryAlertRuleModel; reason: string }[]> {
    const rules = this.db
      .select()
      .from(inventoryAlertRules)
      .where(and(eq(inventoryAlertRules.shelterId, this.activeShelterId), eq(inventoryAlertRules.isActive, true)))
      .all();

    const alerts: { item: InventoryItemModel; rule: InventoryAlertRuleModel; reason: string }[] = [];
    const nowTime = Date.now();

    for (const rule of rules) {
      const item = await this.getById(rule.inventoryItemId);
      if (!item) continue;

      if (rule.triggerType === 'LOW_STOCK_THRESHOLD' && rule.thresholdValue !== null) {
        if (item.quantity <= rule.thresholdValue) {
          alerts.push({
            item,
            rule,
            reason: `Low Stock: current quantity (${item.quantity} ${item.unitOfMeasure}) is at or below threshold (${rule.thresholdValue} ${item.unitOfMeasure})`,
          });
        }
      } else if (rule.triggerType === 'EXPIRATION_WINDOW' && rule.daysBeforeExpiration && item.expirationDate) {
        const expTime = new Date(item.expirationDate).getTime();
        const daysRemaining = (expTime - nowTime) / (1000 * 60 * 60 * 24);
        if (daysRemaining <= rule.daysBeforeExpiration) {
          alerts.push({
            item,
            rule,
            reason: `Expiration Warning: item expires in ${Math.ceil(daysRemaining)} days (${item.expirationDate})`,
          });
        }
      }
    }

    return alerts;
  }

  async createUsageTemplate(
    name: string,
    description: string | null,
    items: { inventoryItemId: string; quantityToDecrement: number }[]
  ): Promise<InventoryUsageTemplateModel> {
    const templateId = generateUUIDv7();
    const now = new Date().toISOString();

    const template = {
      id: templateId,
      shelterId: this.activeShelterId,
      name,
      description,
      createdAt: now,
      updatedAt: now,
    };

    this.db.insert(inventoryUsageTemplates).values(template).run();

    for (const item of items) {
      this.db
        .insert(inventoryUsageTemplateItems)
        .values({
          id: generateUUIDv7(),
          templateId,
          inventoryItemId: item.inventoryItemId,
          quantityToDecrement: item.quantityToDecrement,
          createdAt: now,
        })
        .run();
    }

    return template;
  }

  async applyUsageTemplate(templateId: string): Promise<void> {
    const templateItems = this.db
      .select()
      .from(inventoryUsageTemplateItems)
      .where(eq(inventoryUsageTemplateItems.templateId, templateId))
      .all();

    if (templateItems.length === 0) {
      throw new Error(`Usage template ${templateId} has no items.`);
    }

    // Atomic transaction decrement
    for (const tItem of templateItems) {
      const item = await this.getById(tItem.inventoryItemId);
      if (!item) {
        throw new Error(`Inventory item ${tItem.inventoryItemId} not found.`);
      }
      const newQty = Math.max(0, item.quantity - tItem.quantityToDecrement);
      await this.updateQuantity(item.id, newQty);
    }
  }
}
