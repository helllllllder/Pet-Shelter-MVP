import { z } from 'zod';

export const OperatorProfileSchema = z.object({
  id: z.string().uuid(),
  fullName: z.string().min(1, 'Full name is required'),
  email: z.string().email('Invalid email address'),
  phone: z.string().nullable().optional(),
  lastActiveShelterId: z.string().uuid().nullable().optional(),
  deviceInstallId: z.string().min(1),
  createdAt: z.string().datetime().optional(),
  updatedAt: z.string().datetime().optional(),
});

export const ShelterSchema = z.object({
  id: z.string().uuid(),
  name: z.string().min(1, 'Shelter name is required'),
  description: z.string().nullable().optional(),
  address: z.string().nullable().optional(),
  phone: z.string().nullable().optional(),
  email: z.string().email().nullable().optional(),
  isActive: z.boolean().default(true),
  createdAt: z.string().datetime().optional(),
  updatedAt: z.string().datetime().optional(),
});

export const PetSchema = z.object({
  id: z.string().uuid(),
  shelterId: z.string().uuid(),
  name: z.string().min(1, 'Pet name is required'),
  species: z.enum(['CANINE', 'FELINE', 'OTHER']),
  breed: z.string().min(1, 'Breed is required'),
  sex: z.enum(['MALE', 'FEMALE', 'UNKNOWN']),
  color: z.string().min(1, 'Color is required'),
  dateOfBirth: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Date must be YYYY-MM-DD'),
  isDobEstimated: z.boolean().default(false),
  intakeOrigin: z.enum(['STREET_RESCUE', 'OWNER_SURRENDER', 'TRANSFER_INTERNAL', 'TRANSFER_EXTERNAL', 'BORN_IN_SHELTER', 'OTHER']),
  intakeOriginDetails: z.string().nullable().optional(),
  healthStatus: z.enum(['HEALTHY', 'IN_TREATMENT', 'RECOVERING', 'CRITICAL', 'UNKNOWN']).default('HEALTHY'),
  healthConditions: z.array(z.string()).default([]),
  isAvailableForAdoption: z.boolean().default(false),
  outcomeStatus: z.enum(['ACTIVE', 'IN_FOSTER', 'ADOPTED', 'DECEASED', 'TRANSFERRED_INTERNAL', 'TRANSFERRED_EXTERNAL']).default('ACTIVE'),
  outcomeDate: z.string().datetime().nullable().optional(),
  outcomeNotes: z.string().nullable().optional(),
  mediaReferences: z.array(z.any()).default([]),
  createdAt: z.string().datetime().optional(),
  updatedAt: z.string().datetime().optional(),
  deletedAt: z.string().datetime().nullable().optional(),
}).refine(
  (data) => {
    if (data.intakeOrigin === 'OTHER') {
      return !!data.intakeOriginDetails && data.intakeOriginDetails.trim().length > 0;
    }
    return true;
  },
  {
    message: "Mandatory intake details must be provided when intake origin is 'OTHER'",
    path: ['intakeOriginDetails'],
  }
);

export const AdopterDetailSchema = z.object({
  id: z.string().uuid(),
  shelterId: z.string().uuid(),
  petId: z.string().uuid(),
  adopterName: z.string().min(1, 'Adopter name is required'),
  adopterPhone: z.string().min(1, 'Adopter phone is required'),
  adopterAddress: z.string().min(1, 'Adopter address is required'),
  adoptedAt: z.string().datetime(),
  notes: z.string().nullable().optional(),
  createdAt: z.string().datetime().optional(),
  updatedAt: z.string().datetime().optional(),
});

// Phase 2 Zod Schemas
export const InventoryItemSchema = z.object({
  id: z.string().uuid(),
  shelterId: z.string().uuid(),
  name: z.string().min(1, 'Item name is required'),
  category: z.enum(['FOOD', 'MEDICATION', 'CLEANING_SUPPLIES', 'EQUIPMENT', 'OTHER']),
  quantity: z.number().min(0, 'Quantity cannot be negative'),
  unitOfMeasure: z.enum(['UNITS', 'KG', 'G', 'L', 'ML']),
  purchaseDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/).nullable().optional(),
  expirationDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/).nullable().optional(),
  description: z.string().nullable().optional(),
  createdAt: z.string().datetime().optional(),
  updatedAt: z.string().datetime().optional(),
  deletedAt: z.string().datetime().nullable().optional(),
});

export const InventoryAlertRuleSchema = z.object({
  id: z.string().uuid(),
  shelterId: z.string().uuid(),
  inventoryItemId: z.string().uuid(),
  triggerType: z.enum(['LOW_STOCK_THRESHOLD', 'EXPIRATION_WINDOW', 'ESTIMATED_DEPLETION']),
  thresholdValue: z.number().nullable().optional(),
  daysBeforeExpiration: z.number().int().positive().nullable().optional(),
  isActive: z.boolean().default(true),
  createdAt: z.string().datetime().optional(),
  updatedAt: z.string().datetime().optional(),
});

export const MaintenanceTaskSchema = z.object({
  id: z.string().uuid(),
  shelterId: z.string().uuid(),
  taskType: z.enum(['REPAIR', 'PREVENTIVE_MAINTENANCE', 'CLEANING']),
  description: z.string().min(1, 'Description is required'),
  scheduledDate: z.string().datetime(),
  recurrenceIntervalUnit: z.enum(['HOURS', 'DAYS', 'MONTHS', 'YEARS', 'NONE']).default('NONE'),
  recurrenceIntervalValue: z.number().int().min(0).default(0),
  assignedToName: z.string().nullable().optional(),
  status: z.enum(['SCHEDULED', 'IN_PROGRESS', 'COMPLETED', 'CANCELLED']).default('SCHEDULED'),
  completedAt: z.string().datetime().nullable().optional(),
  completedByOperatorName: z.string().nullable().optional(),
  completionNotes: z.string().nullable().optional(),
  createdAt: z.string().datetime().optional(),
  updatedAt: z.string().datetime().optional(),
  deletedAt: z.string().datetime().nullable().optional(),
});

export const NotificationSchema = z.object({
  id: z.string().uuid(),
  shelterId: z.string().uuid(),
  tier: z.enum(['STANDARD', 'CUSTOM']).default('STANDARD'),
  channel: z.enum(['IN_APP', 'EMAIL', 'PUSH']).default('IN_APP'),
  recipientIdentifier: z.string().min(1),
  title: z.string().min(1),
  message: z.string().min(1),
  entityType: z.string().nullable().optional(),
  entityId: z.string().nullable().optional(),
  status: z.enum(['PENDING', 'DELIVERED', 'FAILED', 'ESCALATED']).default('PENDING'),
  retryCount: z.number().int().min(0).default(0),
  maxRetries: z.number().int().min(1).default(3),
  lastAttemptedAt: z.string().datetime().nullable().optional(),
  deliveredAt: z.string().datetime().nullable().optional(),
  createdAt: z.string().datetime().optional(),
});
