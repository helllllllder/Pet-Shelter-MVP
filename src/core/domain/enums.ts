export type Species = 'CANINE' | 'FELINE' | 'OTHER';
export type Sex = 'MALE' | 'FEMALE' | 'UNKNOWN';
export type HealthStatus = 'HEALTHY' | 'IN_TREATMENT' | 'RECOVERING' | 'CRITICAL' | 'UNKNOWN';
export type IntakeOrigin = 'STREET_RESCUE' | 'OWNER_SURRENDER' | 'TRANSFER_INTERNAL' | 'TRANSFER_EXTERNAL' | 'BORN_IN_SHELTER' | 'OTHER';
export type PetOutcomeStatus = 'ACTIVE' | 'IN_FOSTER' | 'ADOPTED' | 'DECEASED' | 'TRANSFERRED_INTERNAL' | 'TRANSFERRED_EXTERNAL';
export type CareModality = 'VACCINE' | 'VERMIFUGE' | 'MEDICATION' | 'PHYSICAL_THERAPY' | 'HOSPITALIZATION' | 'OTHER';
export type RecurrenceUnit = 'HOURS' | 'DAYS' | 'MONTHS' | 'YEARS' | 'NONE';
export type CareOccurrenceStatus = 'SCHEDULED' | 'ADMINISTERED' | 'MISSED' | 'CANCELLED';

// Phase 2 Enums
export type InventoryCategory = 'FOOD' | 'MEDICATION' | 'CLEANING_SUPPLIES' | 'EQUIPMENT' | 'OTHER';
export type UnitOfMeasure = 'UNITS' | 'KG' | 'G' | 'L' | 'ML';
export type InventoryAlertTriggerType = 'LOW_STOCK_THRESHOLD' | 'EXPIRATION_WINDOW' | 'ESTIMATED_DEPLETION';

export type MaintenanceTaskType = 'REPAIR' | 'PREVENTIVE_MAINTENANCE' | 'CLEANING';
export type MaintenanceStatus = 'SCHEDULED' | 'IN_PROGRESS' | 'COMPLETED' | 'CANCELLED';

export type NotificationChannel = 'IN_APP' | 'EMAIL' | 'PUSH';
export type NotificationDeliveryStatus = 'PENDING' | 'DELIVERED' | 'FAILED' | 'ESCALATED';
export type NotificationTier = 'STANDARD' | 'CUSTOM';
