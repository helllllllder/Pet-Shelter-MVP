import { IPetRepository } from '@core/contracts';
import { PetModel, Species, Sex, HealthStatus, IntakeOrigin } from '@core/domain';
import { PetSchema } from '@core/schemas';
import { generateUUIDv7 } from '@core/domain';

export interface CreatePetInput {
  name: string;
  species: Species;
  breed: string;
  sex: Sex;
  color: string;
  dateOfBirth: string; // YYYY-MM-DD
  isDobEstimated?: boolean;
  intakeOrigin: IntakeOrigin;
  intakeOriginDetails?: string | null;
  healthStatus?: HealthStatus;
  healthConditions?: string[];
  isAvailableForAdoption?: boolean;
}

export class CreatePetUseCase {
  constructor(private readonly petRepo: IPetRepository) {}

  async execute(input: CreatePetInput): Promise<PetModel> {
    const id = generateUUIDv7();
    const now = new Date().toISOString();

    const candidate = {
      id,
      shelterId: generateUUIDv7(), // Temporary placeholder for schema validation
      name: input.name?.trim() || '',
      species: input.species,
      breed: input.breed?.trim() || '',
      sex: input.sex,
      color: input.color?.trim() || '',
      dateOfBirth: input.dateOfBirth,
      isDobEstimated: Boolean(input.isDobEstimated),
      intakeOrigin: input.intakeOrigin,
      intakeOriginDetails: input.intakeOriginDetails ? input.intakeOriginDetails.trim() : null,
      healthStatus: input.healthStatus || 'HEALTHY',
      healthConditions: input.healthConditions || [],
      isAvailableForAdoption: Boolean(input.isAvailableForAdoption),
      outcomeStatus: 'ACTIVE' as const,
      outcomeDate: null,
      outcomeNotes: null,
      mediaReferences: [],
      createdAt: now,
      updatedAt: now,
      deletedAt: null,
    };

    // Zod schema assertions including mandatory intakeOriginDetails for OTHER
    PetSchema.parse(candidate);

    return this.petRepo.create({
      name: candidate.name,
      species: candidate.species,
      breed: candidate.breed,
      sex: candidate.sex,
      color: candidate.color,
      dateOfBirth: candidate.dateOfBirth,
      isDobEstimated: candidate.isDobEstimated,
      intakeOrigin: candidate.intakeOrigin,
      intakeOriginDetails: candidate.intakeOriginDetails,
      healthStatus: candidate.healthStatus,
      healthConditions: candidate.healthConditions,
      isAvailableForAdoption: candidate.isAvailableForAdoption,
      outcomeStatus: candidate.outcomeStatus,
      outcomeDate: null,
      outcomeNotes: null,
      mediaReferences: [],
    });
  }
}
