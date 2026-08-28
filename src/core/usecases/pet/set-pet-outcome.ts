import { IPetRepository } from '@core/contracts';
import { PetModel, PetOutcomeStatus } from '@core/domain';
import { AdopterDetailSchema } from '@core/schemas';
import { generateUUIDv7 } from '@core/domain';

export interface SetPetOutcomeInput {
  petId: string;
  outcomeStatus: PetOutcomeStatus;
  outcomeDate?: string;
  outcomeNotes?: string | null;
  adopterDetails?: {
    adopterName: string;
    adopterPhone: string;
    adopterAddress: string;
    notes?: string | null;
  };
}

export class SetPetOutcomeUseCase {
  constructor(
    private readonly petRepo: IPetRepository,
    private readonly db: any // Raw DB for atomic adopter_details insertion
  ) {}

  async execute(input: SetPetOutcomeInput): Promise<PetModel> {
    const pet = await this.petRepo.getById(input.petId);
    if (!pet) {
      throw new Error(`Pet with id ${input.petId} not found.`);
    }

    const now = input.outcomeDate || new Date().toISOString();

    if (input.outcomeStatus === 'ADOPTED') {
      if (!input.adopterDetails) {
        throw new Error('[ADOPTION_DETAILS_REQUIRED] Adopter name, phone, and address are mandatory for adoption outcome.');
      }

      const adopterCandidate = {
        id: generateUUIDv7(),
        shelterId: pet.shelterId,
        petId: pet.id,
        adopterName: input.adopterDetails.adopterName?.trim() || '',
        adopterPhone: input.adopterDetails.adopterPhone?.trim() || '',
        adopterAddress: input.adopterDetails.adopterAddress?.trim() || '',
        adoptedAt: now,
        notes: input.adopterDetails.notes ? input.adopterDetails.notes.trim() : null,
        createdAt: now,
        updatedAt: now,
      };

      AdopterDetailSchema.parse(adopterCandidate);

      // Insert adopter details
      const { adopterDetails: adopterTable } = await import('@adapters/sqlite/schema');
      this.db.insert(adopterTable).values(adopterCandidate).run();
    }

    const updated = await this.petRepo.update(pet.id, {
      outcomeStatus: input.outcomeStatus,
      outcomeDate: now,
      outcomeNotes: input.outcomeNotes || null,
      isAvailableForAdoption: input.outcomeStatus === 'ACTIVE' ? pet.isAvailableForAdoption : false,
    });

    return updated;
  }
}
