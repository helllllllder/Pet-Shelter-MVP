import { describe, expect, it } from 'vitest';
import {
  OperatorCreateSchema,
  OperatorUpdateSchema,
  ShelterCreateSchema,
  PetCreateSchema,
  PetUpdateSchema,
  MediaUploadSchema,
  AdopterCreateSchema,
  VetClinicCreateSchema,
  VetCreateSchema,
  AppointmentCreateSchema,
  VetDocumentCreateSchema,
  CareEventCreateSchema,
  RecurrenceRuleSchema,
  UUIDv7Schema,
  SpeciesSchema,
  SexSchema,
  HealthStatusSchema,
  IntakeOriginSchema,
  CareModalitySchema,
  MimeTypeSchema,
} from './index';

describe('UUIDv7 Schema', () => {
  it('accepts valid UUIDv7', () => {
    const result = UUIDv7Schema.safeParse('550e8400-e29b-71d4-a716-446655440000');
    expect(result.success).toBe(true);
  });

  it('rejects invalid UUID format', () => {
    const result = UUIDv7Schema.safeParse('not-a-uuid');
    expect(result.success).toBe(false);
  });

  it('rejects UUIDv4 (wrong version)', () => {
    const result = UUIDv7Schema.safeParse('550e8400-e29b-41d4-a716-446655440000');
    expect(result.success).toBe(false);
  });
});

describe('Operator schemas', () => {
  it('accepts valid operator creation', () => {
    const result = OperatorCreateSchema.safeParse({ name: 'John Doe', email: 'john@example.com' });
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.email).toBe('john@example.com');
    }
  });

  it('rejects empty name', () => {
    const result = OperatorCreateSchema.safeParse({ name: '', email: 'john@example.com' });
    expect(result.success).toBe(false);
  });

  it('rejects short name', () => {
    const result = OperatorCreateSchema.safeParse({ name: 'J', email: 'john@example.com' });
    expect(result.success).toBe(false);
  });

  it('rejects invalid email', () => {
    const result = OperatorCreateSchema.safeParse({ name: 'John Doe', email: 'not-an-email' });
    expect(result.success).toBe(false);
  });

  it('lowercases email on parse', () => {
    const result = OperatorCreateSchema.safeParse({ name: 'John', email: 'JOHN@EXAMPLE.COM' });
    expect(result.success).toBe(true);
    if (result.success) expect(result.data.email).toBe('john@example.com');
  });

  it('allows partial update', () => {
    const result = OperatorUpdateSchema.safeParse({ name: 'John Smith' });
    expect(result.success).toBe(true);
  });
});

describe('Shelter schema', () => {
  it('accepts valid shelter creation', () => {
    const result = ShelterCreateSchema.safeParse({ name: 'Downtown Shelter' });
    expect(result.success).toBe(true);
  });

  it('rejects empty name', () => {
    const result = ShelterCreateSchema.safeParse({ name: '' });
    expect(result.success).toBe(false);
  });

  it('accepts optional description', () => {
    const result = ShelterCreateSchema.safeParse({ name: 'Shelter', description: 'Main facility' });
    expect(result.success).toBe(true);
  });
});

describe('Pet schema', () => {
  it('accepts valid pet creation', () => {
    const result = PetCreateSchema.safeParse({
      shelterId: '550e8400-e29b-71d4-a716-446655440000',
      name: 'Luna',
      species: 'Cat',
      intakeOrigin: 'StreetRescue',
      healthStatus: 'Healthy',
    });
    expect(result.success).toBe(true);
  });

  it('accepts estimated DOB', () => {
    const result = PetCreateSchema.safeParse({
      shelterId: '550e8400-e29b-71d4-a716-446655440000',
      name: 'Luna',
      dateOfBirth: '2023-01-15',
      estimatedDOB: true,
      species: 'Cat',
      intakeOrigin: 'StreetRescue',
      healthStatus: 'Healthy',
    });
    expect(result.success).toBe(true);
  });

  it('rejects empty name', () => {
    const result = PetCreateSchema.safeParse({
      shelterId: '550e8400-e29b-71d4-a716-446655440000',
      name: '',
      species: 'Cat',
      intakeOrigin: 'StreetRescue',
      healthStatus: 'Healthy',
    });
    expect(result.success).toBe(false);
  });

  it('rejects invalid species', () => {
    const result = PetCreateSchema.safeParse({
      shelterId: '550e8400-e29b-71d4-a716-446655440000',
      name: 'Luna',
      species: 'Hamster' as any,
      intakeOrigin: 'StreetRescue',
      healthStatus: 'Healthy',
    });
    expect(result.success).toBe(false);
  });

  it('accepts optional fields', () => {
    const result = PetCreateSchema.safeParse({
      shelterId: '550e8400-e29b-71d4-a716-446655440000',
      name: 'Luna',
      species: 'Cat',
      sex: 'Female',
      color: 'Orange',
      breed: 'Domestic Shorthair',
      intakeOrigin: 'StreetRescue',
      healthConditions: ['FIV'],
      healthStatus: 'InTreatment',
      availableForAdoption: true,
    });
    expect(result.success).toBe(true);
  });

  it('allows update with partial fields', () => {
    const result = PetUpdateSchema.safeParse({ name: 'Luna Moon' });
    expect(result.success).toBe(true);
  });
});

describe('Species enum', () => {
  for (const species of ['Dog', 'Cat', 'Bird', 'Rabbit', 'Other'] as const) {
    it(`accepts ${species}`, () => {
      expect(SpeciesSchema.safeParse(species).success).toBe(true);
    });
  }
});

describe('Sex enum', () => {
  for (const sex of ['Male', 'Female', 'Unknown'] as const) {
    it(`accepts ${sex}`, () => {
      expect(SexSchema.safeParse(sex).success).toBe(true);
    });
  }
});

describe('HealthStatus enum', () => {
  for (const status of ['Healthy', 'InTreatment', 'Recovering'] as const) {
    it(`accepts ${status}`, () => {
      expect(HealthStatusSchema.safeParse(status).success).toBe(true);
    });
  }
});

describe('IntakeOrigin enum', () => {
  for (const origin of ['StreetRescue', 'OwnerSurrender', 'TransferFromAnotherShelter', 'BornAtShelter', 'Other'] as const) {
    it(`accepts ${origin}`, () => {
      expect(IntakeOriginSchema.safeParse(origin).success).toBe(true);
    });
  }
});

describe('CareModality enum', () => {
  for (const modality of ['Vaccine', 'Vermifuge', 'Medication', 'PhysicalTherapy', 'Grooming'] as const) {
    it(`accepts ${modality}`, () => {
      expect(CareModalitySchema.safeParse(modality).success).toBe(true);
    });
  }
});

describe('MimeType schema', () => {
  it('accepts image/jpeg', () => {
    expect(MimeTypeSchema.safeParse('image/jpeg').success).toBe(true);
  });

  it('accepts video/mp4', () => {
    expect(MimeTypeSchema.safeParse('video/mp4').success).toBe(true);
  });

  it('rejects unsupported type', () => {
    expect(MimeTypeSchema.safeParse('application/pdf').success).toBe(false);
  });
});

describe('MediaUpload schema', () => {
  it('accepts valid media upload', () => {
    const result = MediaUploadSchema.safeParse({
      fileName: 'luna.jpg',
      mimeType: 'image/jpeg',
      fileSizeBytes: 1024,
    });
    expect(result.success).toBe(true);
  });

  it('rejects zero file size', () => {
    const result = MediaUploadSchema.safeParse({
      fileName: 'empty.jpg',
      mimeType: 'image/jpeg',
      fileSizeBytes: 0,
    });
    expect(result.success).toBe(false);
  });
});

describe('Adopter schema', () => {
  it('accepts valid adopter details', () => {
    const result = AdopterCreateSchema.safeParse({
      shelterId: '550e8400-e29b-71d4-a716-446655440000',
      petId: '550e8400-e29b-71d4-a716-446655440001',
      name: 'Jane Smith',
      phone: '555-1234',
      address: '123 Main St',
    });
    expect(result.success).toBe(true);
  });

  it('rejects missing name', () => {
    const result = AdopterCreateSchema.safeParse({
      shelterId: '550e8400-e29b-71d4-a716-446655440000',
      petId: '550e8400-e29b-71d4-a716-446655440001',
      name: '',
      phone: '555-1234',
      address: '123 Main St',
    });
    expect(result.success).toBe(false);
  });
});

describe('VetClinic schema', () => {
  it('accepts valid clinic creation', () => {
    const result = VetClinicCreateSchema.safeParse({
      shelterId: '550e8400-e29b-71d4-a716-446655440000',
      name: 'City Vet Clinic',
      phone: '555-0000',
    });
    expect(result.success).toBe(true);
  });

  it('rejects empty clinic name', () => {
    const result = VetClinicCreateSchema.safeParse({
      shelterId: '550e8400-e29b-71d4-a716-446655440000',
      name: '',
    });
    expect(result.success).toBe(false);
  });
});

describe('Vet schema', () => {
  it('accepts valid vet creation', () => {
    const result = VetCreateSchema.safeParse({
      shelterId: '550e8400-e29b-71d4-a716-446655440000',
      clinicId: '550e8400-e29b-71d4-a716-446655440001',
      name: 'Dr. Smith',
      specialization: 'Exotic Animals',
    });
    expect(result.success).toBe(true);
  });

  it('rejects empty vet name', () => {
    const result = VetCreateSchema.safeParse({
      shelterId: '550e8400-e29b-71d4-a716-446655440000',
      clinicId: '550e8400-e29b-71d4-a716-446655440001',
      name: '',
    });
    expect(result.success).toBe(false);
  });
});

describe('Appointment schema', () => {
  it('accepts valid appointment', () => {
    const result = AppointmentCreateSchema.safeParse({
      shelterId: '550e8400-e29b-71d4-a716-446655440000',
      petId: '550e8400-e29b-71d4-a716-446655440001',
      clinicId: '550e8400-e29b-71d4-a716-446655440002',
      scheduledAt: '2025-09-15T10:00:00Z',
      notes: 'Annual checkup',
    });
    expect(result.success).toBe(true);
  });

  it('accepts optional veterinarianId', () => {
    const result = AppointmentCreateSchema.safeParse({
      shelterId: '550e8400-e29b-71d4-a716-446655440000',
      petId: '550e8400-e29b-71d4-a716-446655440001',
      clinicId: '550e8400-e29b-71d4-a716-446655440002',
      scheduledAt: '2025-09-15T10:00:00Z',
    });
    expect(result.success).toBe(true);
  });

  it('rejects invalid date-time', () => {
    const result = AppointmentCreateSchema.safeParse({
      shelterId: '550e8400-e29b-71d4-a716-446655440000',
      petId: '550e8400-e29b-71d4-a716-446655440001',
      clinicId: '550e8400-e29b-71d4-a716-446655440002',
      scheduledAt: 'not-a-date',
    });
    expect(result.success).toBe(false);
  });
});

describe('VetDocument schema', () => {
  it('accepts valid document', () => {
    const result = VetDocumentCreateSchema.safeParse({
      shelterId: '550e8400-e29b-71d4-a716-446655440000',
      appointmentId: '550e8400-e29b-71d4-a716-446655440001',
      fileName: 'lab-results.pdf',
      filePath: '/storage/lab-results.pdf',
      mimeType: 'image/jpeg',
      fileSizeBytes: 2048,
    });
    expect(result.success).toBe(true);
  });
});

describe('CareEvent schema', () => {
  it('accepts valid care event', () => {
    const result = CareEventCreateSchema.safeParse({
      shelterId: '550e8400-e29b-71d4-a716-446655440000',
      petId: '550e8400-e29b-71d4-a716-446655440001',
      modality: 'Vaccine',
      substance: 'Rabies',
    });
    expect(result.success).toBe(true);
  });

  it('accepts recurring care event', () => {
    const result = CareEventCreateSchema.safeParse({
      shelterId: '550e8400-e29b-71d4-a716-446655440000',
      petId: '550e8400-e29b-71d4-a716-446655440001',
      modality: 'Vermifuge',
      recurrenceRule: { interval: 3, unit: 'months' },
    });
    expect(result.success).toBe(true);
  });

  it('accepts temporary care event', () => {
    const result = CareEventCreateSchema.safeParse({
      shelterId: '550e8400-e29b-71d4-a716-446655440000',
      petId: '550e8400-e29b-71d4-a716-446655440001',
      modality: 'Medication',
      temporaryEndDate: '2025-12-31',
    });
    expect(result.success).toBe(true);
  });

  it('rejects invalid recurrence interval', () => {
    const result = CareEventCreateSchema.safeParse({
      shelterId: '550e8400-e29b-71d4-a716-446655440000',
      petId: '550e8400-e29b-71d4-a716-446655440001',
      modality: 'Vaccine',
      recurrenceRule: { interval: 0, unit: 'days' },
    });
    expect(result.success).toBe(false);
  });
});

describe('RecurrenceRule schema', () => {
  it('accepts valid rule', () => {
    const result = RecurrenceRuleSchema.safeParse({ interval: 1, unit: 'days' });
    expect(result.success).toBe(true);
  });

  it('rejects zero interval', () => {
    const result = RecurrenceRuleSchema.safeParse({ interval: 0, unit: 'days' });
    expect(result.success).toBe(false);
  });

  it('rejects negative interval', () => {
    const result = RecurrenceRuleSchema.safeParse({ interval: -1, unit: 'days' });
    expect(result.success).toBe(false);
  });
});
