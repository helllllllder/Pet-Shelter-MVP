# ADR 0004: Phase 2 Inventory Transaction Engine, Usage Templates, and Notification Escalation

## Status
Accepted

## Context
Phase 2 of Luna's Pet Central introduces:
1. **Categorized Inventory Management (FR19-FR21)**: Physical stock tracking with strict units of measure, configurable alert rules (low stock thresholds, expiration date proximity), and atomic 1-click usage templates executed during care event recording.
2. **Maintenance Task Scheduling (FR22-FR23)**: Facility and equipment tasks with recurrence rules, optional assignees, and completion logging.
3. **Notification Delivery Tiers & Reliability (FR24-FR25)**: Standard in-app notifications and Custom multi-channel notifications with a 3-retry backoff policy and in-app escalation banners on persistent failure.

We need clear architectural decisions for:
- How inventory decrements maintain transactional consistency during care event logging.
- How inventory and maintenance alert rules are evaluated without introducing heavy background polling overhead.
- How notification retry and escalation are modeled in an offline-first architecture with optional online capabilities.

## Decision

### 1. Atomic Transactional Inventory Decrement (FR21)
- We model `inventory_usage_templates` and `inventory_usage_template_items` in SQLite with foreign keys to `inventory_items`.
- When an operator records a care event and selects a usage template, the repository executes a single SQLite transaction (`db.transaction(...)`):
  1. Verifies sufficient stock for all template items (or records a deficit warning if stock is negative).
  2. Updates item quantities atomically (`quantity = quantity - template_item_quantity`).
  3. Inserts the care event and records an audit log entry referencing the inventory decrement.

### 2. Event-Driven & Query-Time Alert Rule Evaluation (FR20, FR23)
- Rather than running heavy battery-draining continuous background daemons, alert evaluation occurs:
  - **On Mutation**: Immediately when an inventory quantity changes or a maintenance task is saved.
  - **On Context Load / Daily Tick**: When the active shelter context is loaded or when the app comes to foreground.
- Query-time evaluation leverages SQLite indexed queries (`quantity <= threshold` OR `expiration_date <= :window`) to return active alerts in `<50ms` (well within NFR02 / NFR05 thresholds).

### 3. Notification Delivery State Machine & Fallback Escalation (FR24, FR25)
- Every notification is recorded in the `notifications` table with status: `PENDING` -> `DELIVERED` or `FAILED`.
- For `Custom` tier notifications with external delivery targets:
  - Retry policy: 3 attempts with exponential backoff (`retry_count <= 3`).
  - Upon 3 failed retries, status transitions to `ESCALATED` and a record is created in `notification_escalation_logs`, which triggers an in-app banner across all screens for that shelter context.

## Consequences

### Positive
- **Guaranteed Consistency**: Care event logging and inventory decrements cannot desynchronize.
- **Zero Polling Overhead**: Pure query-driven and event-driven alert triggers conserve mobile battery and memory.
- **Fail-Safe Alerting**: Operators are never unaware of failed external notifications due to immediate in-app banner escalation.

### Negative / Trade-offs
- Inventory usage templates require foreign key consistency; deleting an inventory item that is part of a template requires explicit template cascade or de-linking.
