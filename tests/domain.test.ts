import { describe, it, expect } from 'vitest';
import { PetSchema, ShelterSchema } from '@core/schemas';

describe('Domain Schemas & Business Rules Validation', () => {
  it('Validates pet schema with standard intake origin', () => {
    const validPet = {
      id: '018e5b47-68f0-7b2a-8742-d11234567890',
      shelterId: '018e5b47-68f1-7c3b-9853-e22345678901',
      name: 'Luna',
      species: 'FELINE',
      breed: 'Domestic Shorthair',
      sex: 'FEMALE',
      color: 'Black',
      dateOfBirth: '2022-04-15',
      isDobEstimated: true,
      intakeOrigin: 'STREET_RESCUE',
      intakeOriginDetails: null,
      healthStatus: 'HEALTHY',
      healthConditions: ['FIV_NEGATIVE'],
      isAvailableForAdoption: true,
      outcomeStatus: 'ACTIVE',
      outcomeDate: null,
      outcomeNotes: null,
      mediaReferences: [],
      createdAt: '2026-08-28T20:00:00.000Z',
      updatedAt: '2026-08-28T20:00:00.000Z',
      deletedAt: null,
    };

    const parseResult = PetSchema.safeParse(validPet);
    expect(parseResult.success).toBe(true);
  });

  it('Rejects pet schema if intakeOrigin is OTHER but intakeOriginDetails is empty', () => {
    const invalidPet = {
      id: '018e5b47-68f0-7b2a-8742-d11234567890',
      shelterId: '018e5b47-68f1-7c3b-9853-e22345678901',
      name: 'Max',
      species: 'CANINE',
      breed: 'Mixed',
      sex: 'MALE',
      color: 'Brown',
      dateOfBirth: '2021-01-01',
      isDobEstimated: false,
      intakeOrigin: 'OTHER',
      intakeOriginDetails: '', // Missing details!
      healthStatus: 'HEALTHY',
      healthConditions: [],
      isAvailableForAdoption: true,
      outcomeStatus: 'ACTIVE',
      outcomeDate: null,
      outcomeNotes: null,
      mediaReferences: [],
      createdAt: '2026-08-28T20:00:00.000Z',
      updatedAt: '2026-08-28T20:00:00.000Z',
      deletedAt: null,
    };

    const parseResult = PetSchema.safeParse(invalidPet);
    expect(parseResult.success).toBe(false);
    if (!parseResult.success) {
      expect(parseResult.error.errors[0].message).toContain('Mandatory intake details must be provided');
    }
  });

  it('Validates shelter schema with default active state', () => {
    const validShelter = {
      id: '018e5b47-68f1-7c3b-9853-e22345678901',
      name: 'Luna Rescue Hub',
      description: 'Primary shelter container',
      address: '123 Rescue Way',
      phone: '+1-555-0100',
      email: 'contact@lunarescue.org',
      isActive: true,
      createdAt: '2026-08-28T20:00:00.000Z',
      updatedAt: '2026-08-28T20:00:00.000Z',
    };

    const parseResult = ShelterSchema.safeParse(validShelter);
    expect(parseResult.success).toBe(true);
  });
});
