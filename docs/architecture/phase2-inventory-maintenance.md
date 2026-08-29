# Technical Architecture Specification: Phase 2 — Inventory, Maintenance & Notification Tiers

**Document ID**: `SPEC-002-phase2-inventory-maintenance`  
**Author**: Antigravity AI Architect & Software Engineer  
**Status**: APPROVED  
**Date**: 2026-08-28  

---

## 1. Scope & System Boundaries

Phase 2 builds directly upon the Phase 1 Hexagonal Architecture and SQLite foundation, adding operational shelter logistics:
1. **Categorized Inventory Management (`FR19`, `FR20`, `FR21`)**:
   - 5 categories: `FOOD`, `MEDICATION`, `CLEANING_SUPPLIES`, `EQUIPMENT`, `OTHER`.
   - Units of measure: `UNITS`, `KG`, `G`, `L`, `ML`.
   - Alert rules: Threshold alerts, estimated depletion alerts, expiration window alerts.
   - 1-Click Inventory Usage Templates integrated into Care Event recording.
2. **Maintenance Scheduling (`FR22`, `FR23`)**:
   - Task types: `REPAIR`, `PREVENTIVE_MAINTENANCE`, `CLEANING`.
   - Recurrence rules, assignee tracking, and completion logging with timestamps.
3. **Notification Tiers & Delivery Reliability (`FR24`, `FR25`)**:
   - Standard Tier (In-App) and Custom Tier (Email / Push).
   - 3-retry delivery state machine with in-app banner escalation on persistent failure.

---

## 2. Hexagonal Domain Model & Schema Additions

### 2.1 Domain Enums & Models (`@core/domain`)

```typescript
export type InventoryCategory = 'FOOD' | 'MEDICATION' | 'CLEANING_SUPPLIES' | 'EQUIPMENT' | 'OTHER';
export type UnitOfMeasure = 'UNITS' | 'KG' | 'G' | 'L' | 'ML';
export type InventoryAlertTriggerType = 'LOW_STOCK_THRESHOLD' | 'EXPIRATION_WINDOW' | 'ESTIMATED_DEPLETION';

export type MaintenanceTaskType = 'REPAIR' | 'PREVENTIVE_MAINTENANCE' | 'CLEANING';
export type MaintenanceStatus = 'SCHEDULED' | 'IN_PROGRESS' | 'COMPLETED' | 'CANCELLED';

export type NotificationChannel = 'IN_APP' | 'EMAIL' | 'PUSH';
export type NotificationDeliveryStatus = 'PENDING' | 'DELIVERED' | 'FAILED' | 'ESCALATED';
export type NotificationTier = 'STANDARD' | 'CUSTOM';
```

### 2.2 SQLite Schema Additions (`@adapters/sqlite/schema.ts`)

```sql
-- 1. Inventory Items Table
CREATE TABLE inventory_items (
    id TEXT PRIMARY KEY,
    shelter_id TEXT NOT NULL REFERENCES shelters(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    category TEXT NOT NULL,
    quantity REAL NOT NULL DEFAULT 0,
    unit_of_measure TEXT NOT NULL,
    purchase_date TEXT,
    expiration_date TEXT,
    description TEXT,
    created_at TEXT NOT NULL,
    updated_at TEXT NOT NULL,
    deleted_at TEXT
);

-- 2. Inventory Alert Rules Table
CREATE TABLE inventory_alert_rules (
    id TEXT PRIMARY KEY,
    shelter_id TEXT NOT NULL REFERENCES shelters(id) ON DELETE CASCADE,
    inventory_item_id TEXT NOT NULL REFERENCES inventory_items(id) ON DELETE CASCADE,
    trigger_type TEXT NOT NULL,
    threshold_value REAL,
    days_before_expiration INTEGER,
    is_active INTEGER NOT NULL DEFAULT 1,
    created_at TEXT NOT NULL,
    updated_at TEXT NOT NULL
);

-- 3. Inventory Usage Templates
CREATE TABLE inventory_usage_templates (
    id TEXT PRIMARY KEY,
    shelter_id TEXT NOT NULL REFERENCES shelters(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    description TEXT,
    created_at TEXT NOT NULL,
    updated_at TEXT NOT NULL
);

-- 4. Inventory Usage Template Items
CREATE TABLE inventory_usage_template_items (
    id TEXT PRIMARY KEY,
    template_id TEXT NOT NULL REFERENCES inventory_usage_templates(id) ON DELETE CASCADE,
    inventory_item_id TEXT NOT NULL REFERENCES inventory_items(id) ON DELETE CASCADE,
    quantity_to_decrement REAL NOT NULL,
    created_at TEXT NOT NULL
);

-- 5. Maintenance Tasks Table
CREATE TABLE maintenance_tasks (
    id TEXT PRIMARY KEY,
    shelter_id TEXT NOT NULL REFERENCES shelters(id) ON DELETE CASCADE,
    task_type TEXT NOT NULL,
    description TEXT NOT NULL,
    scheduled_date TEXT NOT NULL,
    recurrence_interval_unit TEXT NOT NULL DEFAULT 'NONE',
    recurrence_interval_value INTEGER NOT NULL DEFAULT 0,
    assigned_to_name TEXT,
    status TEXT NOT NULL DEFAULT 'SCHEDULED',
    completed_at TEXT,
    completed_by_operator_name TEXT,
    completion_notes TEXT,
    created_at TEXT NOT NULL,
    updated_at TEXT NOT NULL,
    deleted_at TEXT
);

-- 6. Notifications Table
CREATE TABLE notifications (
    id TEXT PRIMARY KEY,
    shelter_id TEXT NOT NULL REFERENCES shelters(id) ON DELETE CASCADE,
    tier TEXT NOT NULL DEFAULT 'STANDARD',
    channel TEXT NOT NULL DEFAULT 'IN_APP',
    recipient_identifier TEXT NOT NULL,
    title TEXT NOT NULL,
    message TEXT NOT NULL,
    entity_type TEXT,
    entity_id TEXT,
    status TEXT NOT NULL DEFAULT 'PENDING',
    retry_count INTEGER NOT NULL DEFAULT 0,
    max_retries INTEGER NOT NULL DEFAULT 3,
    last_attempted_at TEXT,
    delivered_at TEXT,
    created_at TEXT NOT NULL
);

-- 7. Notification Escalation Logs Table
CREATE TABLE notification_escalation_logs (
    id TEXT PRIMARY KEY,
    notification_id TEXT NOT NULL REFERENCES notifications(id) ON DELETE CASCADE,
    shelter_id TEXT NOT NULL REFERENCES shelters(id) ON DELETE CASCADE,
    failure_reason TEXT NOT NULL,
    is_dismissed INTEGER NOT NULL DEFAULT 0,
    created_at TEXT NOT NULL,
    dismissed_at TEXT
);
```

---

## 3. Scoped Repository Contracts (`@core/contracts`)

```typescript
export interface IInventoryRepository {
  getById(id: string): Promise<InventoryItemModel | null>;
  listByCategory(category?: InventoryCategory): Promise<InventoryItemModel[]>;
  create(data: Omit<InventoryItemModel, 'id' | 'shelterId' | 'createdAt' | 'updatedAt' | 'deletedAt'>): Promise<InventoryItemModel>;
  updateQuantity(id: string, newQuantity: number): Promise<InventoryItemModel>;
  createAlertRule(rule: Omit<InventoryAlertRuleModel, 'id' | 'shelterId' | 'createdAt' | 'updatedAt'>): Promise<InventoryAlertRuleModel>;
  listActiveAlerts(): Promise<{ item: InventoryItemModel; rule: InventoryAlertRuleModel; reason: string }[]>;
  createUsageTemplate(name: string, items: { inventoryItemId: string; quantity: number }[]): Promise<InventoryUsageTemplateModel>;
  applyUsageTemplate(templateId: string): Promise<void>;
}

export interface IMaintenanceRepository {
  getById(id: string): Promise<MaintenanceTaskModel | null>;
  listTasks(status?: MaintenanceStatus): Promise<MaintenanceTaskModel[]>;
  createTask(data: Omit<MaintenanceTaskModel, 'id' | 'shelterId' | 'createdAt' | 'updatedAt' | 'deletedAt'>): Promise<MaintenanceTaskModel>;
  markCompleted(id: string, operatorName: string, notes?: string): Promise<MaintenanceTaskModel>;
}

export interface INotificationRepository {
  createNotification(notification: Omit<NotificationModel, 'id' | 'shelterId' | 'createdAt'>): Promise<NotificationModel>;
  listPending(): Promise<NotificationModel[]>;
  markDelivered(id: string): Promise<void>;
  recordFailure(id: string, reason: string): Promise<{ newStatus: NotificationDeliveryStatus }>;
  listActiveEscalations(): Promise<NotificationEscalationModel[]>;
  dismissEscalation(escalationId: string): Promise<void>;
}
```

---

## 4. Tracer-Bullet Issue Roadmap (Phase 2)

| Issue # | Scope | Requirements | Test Coverage |
| :--- | :--- | :--- | :--- |
| **#12** | **Phase 2 Schema & Drizzle Migration** | Database schema additions for inventory, alert rules, usage templates, maintenance tasks, notifications | `tests/phase2-schema.test.ts` |
| **#13** | **Categorized Inventory Management Core** | FR19: Item CRUD, UoM validation, quantity adjustments | `tests/inventory-core.test.ts` |
| **#14** | **Configurable Inventory Alert Rules Engine** | FR20: Low stock thresholds, expiration window alerts | `tests/inventory-alerts.test.ts` |
| **#15** | **Inventory 1-Click Usage Templates** | FR21: Template definitions, atomic care event decrements | `tests/inventory-templates.test.ts` |
| **#16** | **Maintenance Task Scheduling & Recurrence** | FR22: Task creation, types, recurrence scheduling | `tests/maintenance-core.test.ts` |
| **#17** | **Maintenance Notifications & Completion Logging** | FR23: Due alerts, completion logs with timestamp & staff | `tests/maintenance-completion.test.ts` |
| **#18** | **Two-Tier Notification Delivery Engine** | FR24: Standard in-app vs Custom multi-channel dispatch | `tests/notification-dispatch.test.ts` |
| **#19** | **Notification 3-Retry & In-App Banner Escalation** | FR25: Retry state machine, exponential backoff, banner | `tests/notification-escalation.test.ts` |
