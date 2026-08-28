import { z } from 'zod';

export const SpeciesSchema = z.enum(['CANINE', 'FELINE', 'OTHER']);
export const SexSchema = z.enum(['MALE', 'FEMALE', 'UNKNOWN']);
export const HealthStatusSchema = z.enum(['HEALTHY', 'IN_TREATMENT', 'RECOVERING']);
export const IntakeOriginSchema = z.enum([
  'STREET_RESCUE',
  'OWNER_SURRENDER',
  'TRANSFER_SHELTER',
  'BORN_IN_SHELTER',
  'OTHER',
]);
export const PetOutcomeStatusSchema = z.enum([
  'ACTIVE',
  'IN_FOSTER',
  'ADOPTED',
  'DECEASED',
  'TRANSFERRED_INTERNAL',
  'TRANSFERRED_EXTERNAL',
]);

export const OperatorProfileSchema = z.object({
  id: z.string().uuid(),
  fullName: z.string().min(1, 'Full name is required'),
  email: z.string().email('Invalid email address'),
  phone: z.string().nullable(),
  lastActiveShelterId: z.string().uuid().nullable(),
  deviceInstallId: z.string().min(1),
  createdAt: z.string().datetime(),
  updatedAt: z.string().datetime(),
});

export const ShelterSchema = z.object({
  id: z.string().uuid(),
  name: z.string().min(1, 'Shelter name is required'),
  description: z.string().nullable(),
  address: z.string().nullable(),
  phone: z.string().nullable(),
  email: z.string().email().nullable().or(z.literal('')),
  isActive: z.boolean().default(true),
  createdAt: z.string().datetime(),
  updatedAt: z.string().datetime(),
});

export const PetSchema = z.object({
  id: z.string().uuid(),
  shelterId: z.string().uuid(),
  name: z.string().min(1, 'Pet name is required'),
  species: SpeciesSchema,
  breed: z.string().min(1, 'Breed is required'),
  sex: SexSchema,
  color: z.string().min(1, 'Color is required'),
  dateOfBirth: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Date must be YYYY-MM-DD'),
  isDobEstimated: z.boolean().default(false),
  intakeOrigin: IntakeOriginSchema,
  intakeOriginDetails: z.string().nullable(),
  healthStatus: HealthStatusSchema.default('HEALTHY'),
  healthConditions: z.array(z.string()).default([]),
  isAvailableForAdoption: z.boolean().default(false),
  outcomeStatus: PetOutcomeStatusSchema.default('ACTIVE'),
  outcomeDate: z.string().datetime().nullable(),
  outcomeNotes: z.string().nullable(),
  mediaReferences: z.array(
    z.object({
      id: z.string().uuid(),
      type: z.enum(['PHOTO', 'VIDEO']),
      localUri: z.string(),
      fileName: z.string(),
      fileSizeBytes: z.number().nonnegative(),
      uploadedAt: z.string().datetime(),
    })
  ).default([]),
  createdAt: z.string().datetime(),
  updatedAt: z.string().datetime(),
  deletedAt: z.string().datetime().nullable(),
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
  notes: z.string().nullable(),
  createdAt: z.string().datetime(),
  updatedAt: z.string().datetime(),
});
