import { z } from 'zod';

export const ExportOperatorSchema = z.object({
  operatorId: z.string().uuid(),
  fullName: z.string().min(1),
  email: z.string().email(),
});

export const ExportShelterContainerSchema = z.object({
  shelterId: z.string().uuid(),
  name: z.string().min(1),
  description: z.string().nullable(),
  address: z.string().nullable(),
  phone: z.string().nullable(),
  email: z.string().nullable(),
  isActive: z.boolean(),
  createdAt: z.string().datetime(),
  pets: z.array(z.any()).default([]),
  adopterDetails: z.array(z.any()).default([]),
  vetClinics: z.array(z.any()).default([]),
  veterinarians: z.array(z.any()).default([]),
  vetAppointments: z.array(z.any()).default([]),
  vetDocuments: z.array(z.any()).default([]),
  careEvents: z.array(z.any()).default([]),
  careEventOccurrences: z.array(z.any()).default([]),
  auditLogs: z.array(z.any()).default([]),
});

export const ExportEnvelopeSchema = z.object({
  $schema: z.string().url(),
  schemaVersion: z.literal('1.0.0'),
  exportedAtUtc: z.string().datetime(),
  exportType: z.enum(['SINGLE_SHELTER', 'ALL_SHELTERS']),
  checksumSha256: z.string().regex(/^[a-f0-9]{64}$/i),
  operator: ExportOperatorSchema,
  shelterCount: z.number().int().min(1),
  shelters: z.array(ExportShelterContainerSchema).min(1),
});

export type ExportEnvelope = z.infer<typeof ExportEnvelopeSchema>;
