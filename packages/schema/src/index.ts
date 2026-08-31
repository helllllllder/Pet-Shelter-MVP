/**
 * @luna/schema — Zod validation schemas for all Phase 1 entities.
 *
 * Each schema validates input data against the domain model and maps
 * cleanly to the Drizzle ORM table definitions in src/adapters/sqlite/schema.ts.
 */

import { z } from 'zod';

// ─── Enums ────────────────────────────────────────────────────────────────────

export const SpeciesSchema = z.enum(['Dog', 'Cat', 'Bird', 'Rabbit', 'Other']);
export const SexSchema = z.enum(['Male', 'Female', 'Unknown']);
export const HealthStatusSchema = z.enum(['Healthy', 'InTreatment', 'Recovering']);
export const IntakeOriginSchema = z.enum([
  'StreetRescue',
  'OwnerSurrender',
  'TransferFromAnotherShelter',
  'BornAtShelter',
  'Other',
]);

export const PetOutcomeSchema = z.enum(['adopted', 'deceased', 'transferred_external']);
export const PetStatusSchema = z.enum(['active', 'in_foster', 'archived']);

export const MediaTypeSchema = z.enum(['photo', 'video']);
export const MimeTypeSchema = z.enum([
  'image/jpeg',
  'image/png',
  'image/gif',
  'video/mp4',
  'video/quicktime',
]);

export const CareModalitySchema = z.enum([
  'Vaccine',
  'Vermifuge',
  'Medication',
  'PhysicalTherapy',
  'Grooming',
]);
export const RecurrenceUnitSchema = z.enum(['hours', 'days', 'months', 'years']);
export const CareEventStatusSchema = z.enum(['Pending', 'Due', 'Overdue', 'Completed', 'Cancelled']);
export const CareOccurrenceStatusSchema = z.enum(['Pending', 'Completed', 'Cancelled']);

// ─── UUIDv7 ───────────────────────────────────────────────────────────────────

const UUIDv7Regex = /^[0-9a-f]{8}-[0-9a-f]{4}-7[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
export const UUIDv7Schema = z.string().regex(UUIDv7Regex, 'Must be a valid UUIDv7');

// ─── Operator ─────────────────────────────────────────────────────────────────

export const OperatorCreateSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  email: z.string().email('Must be a valid email address').toLowerCase(),
});

export const OperatorUpdateSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters').optional(),
  email: z.string().email('Must be a valid email address').toLowerCase().optional(),
});

// ─── Shelter ──────────────────────────────────────────────────────────────────

export const ShelterCreateSchema = z.object({
  name: z.string().min(2, 'Shelter name must be at least 2 characters'),
  description: z.string().min(1).optional().or(z.literal('')).transform((v) => v || undefined),
});

export const ShelterUpdateSchema = z.object({
  name: z.string().min(2, 'Shelter name must be at least 2 characters').optional(),
  description: z.string().min(1).optional().or(z.literal('')).transform((v) => v || undefined),
});

// ─── Pet ──────────────────────────────────────────────────────────────────────

export const PetCreateSchema = z.object({
  shelterId: UUIDv7Schema,
  name: z.string().min(1, 'Pet name is required'),
  dateOfBirth: z.string().date('Must be a valid date').optional().or(z.null()),
  estimatedDOB: z.boolean().default(false),
  species: SpeciesSchema,
  breed: z.string().min(1).optional().or(z.literal('')).transform((v) => v || undefined),
  sex: SexSchema.optional(),
  color: z.string().min(1).optional().or(z.literal('')).transform((v) => v || undefined),
  intakeOrigin: IntakeOriginSchema,
  intakeOriginOther: z.string().min(1).optional().or(z.literal('')).transform((v) => v || undefined),
  healthConditions: z.array(z.string()).default([]),
  healthStatus: HealthStatusSchema,
  availableForAdoption: z.boolean().default(false),
});

export const PetUpdateSchema = z.object({
  name: z.string().min(1, 'Pet name is required').optional(),
  dateOfBirth: z.string().date('Must be a valid date').optional().or(z.null()),
  estimatedDOB: z.boolean().optional(),
  species: SpeciesSchema.optional(),
  breed: z.string().min(1).optional().or(z.literal('')).transform((v) => v || undefined),
  sex: SexSchema.optional(),
  color: z.string().min(1).optional().or(z.literal('')).transform((v) => v || undefined),
  intakeOrigin: IntakeOriginSchema.optional(),
  intakeOriginOther: z.string().min(1).optional().or(z.literal('')).transform((v) => v || undefined),
  healthConditions: z.array(z.string()).optional(),
  healthStatus: HealthStatusSchema.optional(),
  availableForAdoption: z.boolean().optional(),
});

// ─── Media ────────────────────────────────────────────────────────────────────

export const MediaUploadSchema = z.object({
  fileName: z.string().min(1),
  mimeType: MimeTypeSchema,
  fileSizeBytes: z.number().int().positive(),
});

// ─── Adopter ──────────────────────────────────────────────────────────────────

export const AdopterCreateSchema = z.object({
  shelterId: UUIDv7Schema,
  petId: UUIDv7Schema,
  name: z.string().min(1, 'Adopter name is required'),
  phone: z.string().min(1, 'Phone is required'),
  address: z.string().min(1, 'Address is required'),
});

// ─── Veterinary Clinic ────────────────────────────────────────────────────────

export const VetClinicCreateSchema = z.object({
  shelterId: UUIDv7Schema,
  name: z.string().min(1, 'Clinic name is required'),
  address: z.string().min(1).optional().or(z.literal('')).transform((v) => v || undefined),
  phone: z.string().min(1).optional().or(z.literal('')).transform((v) => v || undefined),
  email: z.string().email('Must be a valid email').optional().or(z.literal('')).transform((v) => v || undefined),
});

export const VetClinicUpdateSchema = z.object({
  name: z.string().min(1, 'Clinic name is required').optional(),
  address: z.string().min(1).optional().or(z.literal('')).transform((v) => v || undefined),
  phone: z.string().min(1).optional().or(z.literal('')).transform((v) => v || undefined),
  email: z.string().email('Must be a valid email').optional().or(z.literal('')).transform((v) => v || undefined),
});

// ─── Veterinarian ─────────────────────────────────────────────────────────────

export const VetCreateSchema = z.object({
  shelterId: UUIDv7Schema,
  clinicId: UUIDv7Schema,
  name: z.string().min(1, 'Veterinarian name is required'),
  specialization: z.string().min(1).optional().or(z.literal('')).transform((v) => v || undefined),
  phone: z.string().min(1).optional().or(z.literal('')).transform((v) => v || undefined),
  email: z.string().email('Must be a valid email').optional().or(z.literal('')).transform((v) => v || undefined),
});

export const VetUpdateSchema = z.object({
  name: z.string().min(1, 'Veterinarian name is required').optional(),
  specialization: z.string().min(1).optional().or(z.literal('')).transform((v) => v || undefined),
  phone: z.string().min(1).optional().or(z.literal('')).transform((v) => v || undefined),
  email: z.string().email('Must be a valid email').optional().or(z.literal('')).transform((v) => v || undefined),
});

// ─── Appointment ──────────────────────────────────────────────────────────────

export const AppointmentCreateSchema = z.object({
  shelterId: UUIDv7Schema,
  petId: UUIDv7Schema,
  clinicId: UUIDv7Schema,
  veterinarianId: UUIDv7Schema.optional().nullable(),
  scheduledAt: z.string().datetime('Must be a valid date-time'),
  notes: z.string().min(1).optional().or(z.literal('')).transform((v) => v || undefined),
});

export const AppointmentUpdateSchema = z.object({
  clinicId: UUIDv7Schema.optional(),
  veterinarianId: UUIDv7Schema.optional().nullable(),
  scheduledAt: z.string().datetime('Must be a valid date-time').optional(),
  notes: z.string().min(1).optional().or(z.literal('')).transform((v) => v || undefined),
});

// ─── Vet Document ─────────────────────────────────────────────────────────────

export const VetDocumentCreateSchema = z.object({
  shelterId: UUIDv7Schema,
  appointmentId: UUIDv7Schema,
  fileName: z.string().min(1),
  filePath: z.string().min(1),
  mimeType: MimeTypeSchema,
  fileSizeBytes: z.number().int().positive(),
});

// ─── Care Event ───────────────────────────────────────────────────────────────

export const RecurrenceRuleSchema = z.object({
  interval: z.number().int().positive(),
  unit: RecurrenceUnitSchema,
});

export const CareEventCreateSchema = z.object({
  shelterId: UUIDv7Schema,
  petId: UUIDv7Schema,
  modality: CareModalitySchema,
  substance: z.string().min(1).optional().or(z.literal('')).transform((v) => v || undefined),
  instructions: z.string().min(1).optional().or(z.literal('')).transform((v) => v || undefined),
  recurrenceRule: RecurrenceRuleSchema.optional(),
  temporaryEndDate: z.string().date('Must be a valid date').optional().or(z.null()),
  appointmentId: UUIDv7Schema.optional().nullable(),
});

export const CareEventUpdateSchema = z.object({
  substance: z.string().min(1).optional().or(z.literal('')).transform((v) => v || undefined),
  instructions: z.string().min(1).optional().or(z.literal('')).transform((v) => v || undefined),
  recurrenceRule: RecurrenceRuleSchema.optional(),
  temporaryEndDate: z.string().date('Must be a valid date').optional().or(z.null()),
});

// ─── Care Occurrence ──────────────────────────────────────────────────────────

export const CareOccurrenceCreateSchema = z.object({
  shelterId: UUIDv7Schema,
  careEventId: UUIDv7Schema,
  scheduledDate: z.string().datetime('Must be a valid date-time'),
});

// ─── Dashboard ────────────────────────────────────────────────────────────────

export const DashboardOverviewSchema = z.object({
  totalActivePets: z.number().int().nonnegative(),
  petsInTreatment: z.number().int().nonnegative(),
  petsInFoster: z.number().int().nonnegative(),
  dueCareEvents: z.number().int().nonnegative(),
  overdueCareEvents: z.number().int().nonnegative(),
});

// ─── Re-exports ───────────────────────────────────────────────────────────────

export type OperatorCreateInput = z.infer<typeof OperatorCreateSchema>;
export type OperatorUpdateInput = z.infer<typeof OperatorUpdateSchema>;
export type ShelterCreateInput = z.infer<typeof ShelterCreateSchema>;
export type ShelterUpdateInput = z.infer<typeof ShelterUpdateSchema>;
export type PetCreateInput = z.infer<typeof PetCreateSchema>;
export type PetUpdateInput = z.infer<typeof PetUpdateSchema>;
export type MediaUploadInput = z.infer<typeof MediaUploadSchema>;
export type AdopterCreateInput = z.infer<typeof AdopterCreateSchema>;
export type VetClinicCreateInput = z.infer<typeof VetClinicCreateSchema>;
export type VetClinicUpdateInput = z.infer<typeof VetClinicUpdateSchema>;
export type VetCreateInput = z.infer<typeof VetCreateSchema>;
export type VetUpdateInput = z.infer<typeof VetUpdateSchema>;
export type AppointmentCreateInput = z.infer<typeof AppointmentCreateSchema>;
export type AppointmentUpdateInput = z.infer<typeof AppointmentUpdateSchema>;
export type VetDocumentCreateInput = z.infer<typeof VetDocumentCreateSchema>;
export type CareEventCreateInput = z.infer<typeof CareEventCreateSchema>;
export type CareEventUpdateInput = z.infer<typeof CareEventUpdateSchema>;
export type CareOccurrenceCreateInput = z.infer<typeof CareOccurrenceCreateSchema>;
export type DashboardOverviewInput = z.infer<typeof DashboardOverviewSchema>;
