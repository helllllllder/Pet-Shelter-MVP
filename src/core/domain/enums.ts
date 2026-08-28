/**
 * Core Domain Enums (Canonical vocabulary aligned with CONTEXT.md)
 */

export type Species = 'CANINE' | 'FELINE' | 'OTHER';

export type Sex = 'MALE' | 'FEMALE' | 'UNKNOWN';

export type HealthStatus = 'HEALTHY' | 'IN_TREATMENT' | 'RECOVERING';

export type IntakeOrigin =
  | 'STREET_RESCUE'
  | 'OWNER_SURRENDER'
  | 'TRANSFER_SHELTER'
  | 'BORN_IN_SHELTER'
  | 'OTHER';

export type PetOutcomeStatus =
  | 'ACTIVE'
  | 'IN_FOSTER'
  | 'ADOPTED'
  | 'DECEASED'
  | 'TRANSFERRED_INTERNAL'
  | 'TRANSFERRED_EXTERNAL';

export type CareModality =
  | 'VACCINE'
  | 'VERMIFUGE'
  | 'MEDICATION'
  | 'PHYSICAL_THERAPY'
  | 'HOSPITALIZATION'
  | 'OTHER';

export type RecurrenceUnit = 'HOURS' | 'DAYS' | 'MONTHS' | 'YEARS' | 'NONE';

export type CareOccurrenceStatus = 'SCHEDULED' | 'DUE' | 'ADMINISTERED' | 'MISSED' | 'CANCELLED';

export type DocumentMimeType = 'APPLICATION_PDF' | 'IMAGE_JPEG' | 'IMAGE_PNG';

export type AuditAction = 'CREATE' | 'UPDATE' | 'DELETE' | 'ARCHIVE' | 'EXPORT' | 'GDPR_ERASURE';
