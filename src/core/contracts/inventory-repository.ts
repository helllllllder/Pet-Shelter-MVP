import { InventoryItemModel, InventoryCategory, InventoryAlertRuleModel, InventoryUsageTemplateModel } from '../domain';

export interface IInventoryRepository {
  getById(id: string): Promise<InventoryItemModel | null>;
  listByCategory(category?: InventoryCategory): Promise<InventoryItemModel[]>;
  create(data: Omit<InventoryItemModel, 'id' | 'shelterId' | 'createdAt' | 'updatedAt' | 'deletedAt'>): Promise<InventoryItemModel>;
  updateQuantity(id: string, newQuantity: number): Promise<InventoryItemModel>;
  softDelete(id: string): Promise<void>;
  createAlertRule(rule: Omit<InventoryAlertRuleModel, 'id' | 'shelterId' | 'createdAt' | 'updatedAt'>): Promise<InventoryAlertRuleModel>;
  listActiveAlerts(): Promise<{ item: InventoryItemModel; rule: InventoryAlertRuleModel; reason: string }[]>;
  createUsageTemplate(name: string, description: string | null, items: { inventoryItemId: string; quantityToDecrement: number }[]): Promise<InventoryUsageTemplateModel>;
  applyUsageTemplate(templateId: string): Promise<void>;
}
