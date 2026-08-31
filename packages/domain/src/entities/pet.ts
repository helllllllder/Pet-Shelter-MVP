import { generateUUIDv7 } from '../uuid';
import { PetStatus, PetOutcome } from '../pet-lifecycle';

export type Species = 'Dog' | 'Cat' | 'Bird' | 'Rabbit' | 'Other';
export type Sex = 'Male' | 'Female' | 'Unknown';
export type HealthStatus = 'Healthy' | 'InTreatment' | 'Recovering';
export type IntakeOrigin =
  | 'StreetRescue'
  | 'OwnerSurrender'
  | 'TransferFromAnotherShelter'
  | 'BornAtShelter'
  | 'Other';

export interface PetProfile {
  id: string;
  shelterId: string;
  name: string;
  dateOfBirth?: Date;
  estimatedDOB: boolean;
  species: Species;
  breed?: string;
  sex?: Sex;
  color?: string;
  intakeOrigin: IntakeOrigin;
  intakeOriginOther?: string;
  healthConditions: string[];
  healthStatus: HealthStatus;
  status: PetStatus;
  outcome?: PetOutcome;
  availableForAdoption: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export class PetValidationError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'PetValidationError';
  }
}

export class Pet {
  static create(
    shelterId: string,
    name: string,
    species: Species,
    intakeOrigin: IntakeOrigin,
    healthStatus: HealthStatus,
    options?: {
      dateOfBirth?: Date;
      estimatedDOB?: boolean;
      breed?: string;
      sex?: Sex;
      color?: string;
      intakeOriginOther?: string;
      healthConditions?: string[];
      availableForAdoption?: boolean;
    },
  ): PetProfile {
    const validated = Pet.validate(name, species, intakeOrigin, healthStatus, options);
    const now = new Date();
    return {
      id: generateUUIDv7(),
      shelterId,
      name: validated.name,
      dateOfBirth: validated.dateOfBirth,
      estimatedDOB: validated.estimatedDOB,
      species: validated.species,
      breed: validated.breed,
      sex: validated.sex,
      color: validated.color,
      intakeOrigin: validated.intakeOrigin,
      intakeOriginOther: validated.intakeOriginOther,
      healthConditions: validated.healthConditions,
      healthStatus: validated.healthStatus,
      status: PetStatus.Active,
      availableForAdoption: validated.availableForAdoption,
      createdAt: now,
      updatedAt: now,
    };
  }

  static update(
    pet: PetProfile,
    updates: Partial<Omit<PetProfile, 'id' | 'shelterId' | 'status' | 'createdAt' | 'updatedAt'>>,
  ): PetProfile {
    const validated = Pet.validatePartial(pet, updates);
    return {
      ...pet,
      ...validated,
      updatedAt: new Date(),
    };
  }

  private static validate(
    name: string,
    species: Species,
    intakeOrigin: IntakeOrigin,
    healthStatus: HealthStatus,
    options?: {
      dateOfBirth?: Date;
      estimatedDOB?: boolean;
      breed?: string;
      sex?: Sex;
      color?: string;
      intakeOriginOther?: string;
      healthConditions?: string[];
      availableForAdoption?: boolean;
    },
  ): Omit<PetProfile, 'id' | 'shelterId' | 'status' | 'createdAt' | 'updatedAt'> {
    const trimmedName = name.trim();
    if (!trimmedName) {
      throw new PetValidationError('Pet name is required');
    }

    const estimatedDOB = options?.estimatedDOB ?? false;
    const dateOfBirth = options?.dateOfBirth;

    if (dateOfBirth && estimatedDOB === false && dateOfBirth > new Date()) {
      throw new PetValidationError('Date of birth cannot be in the future');
    }

    return {
      name: trimmedName,
      dateOfBirth,
      estimatedDOB,
      species,
      breed: options?.breed?.trim() || undefined,
      sex: options?.sex,
      color: options?.color?.trim() || undefined,
      intakeOrigin,
      intakeOriginOther:
        intakeOrigin === 'Other' ? (options?.intakeOriginOther?.trim() || undefined) : undefined,
      healthConditions: options?.healthConditions ?? [],
      healthStatus,
      availableForAdoption: options?.availableForAdoption ?? false,
    };
  }

  private static validatePartial(
    pet: PetProfile,
    updates: Partial<Omit<PetProfile, 'id' | 'shelterId' | 'status' | 'createdAt' | 'updatedAt'>>,
  ): Partial<Omit<PetProfile, 'id' | 'shelterId' | 'status' | 'createdAt' | 'updatedAt'>> {
    const result: Record<string, unknown> = {};

    if (updates.name !== undefined) {
      const trimmedName = updates.name.trim();
      if (!trimmedName) {
        throw new PetValidationError('Pet name is required');
      }
      result.name = trimmedName;
    }

    if (updates.dateOfBirth !== undefined && updates.estimatedDOB === false && updates.dateOfBirth > new Date()) {
      throw new PetValidationError('Date of birth cannot be in the future');
    }

    if (updates.breed !== undefined) {
      result.breed = updates.breed.trim() || undefined;
    }
    if (updates.color !== undefined) {
      result.color = updates.color.trim() || undefined;
    }
    if (updates.intakeOriginOther !== undefined && updates.intakeOrigin === 'Other') {
      result.intakeOriginOther = updates.intakeOriginOther.trim() || undefined;
    }

    return result as Partial<Omit<PetProfile, 'id' | 'shelterId' | 'status' | 'createdAt' | 'updatedAt'>>;
  }
}
