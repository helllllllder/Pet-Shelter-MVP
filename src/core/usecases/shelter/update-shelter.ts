import { IShelterRepository } from '@core/contracts';
import { ShelterModel } from '@core/domain';

export interface UpdateShelterInput {
  name?: string;
  description?: string | null;
  address?: string | null;
  phone?: string | null;
  email?: string | null;
  isActive?: boolean;
}

export class UpdateShelterUseCase {
  constructor(private readonly shelterRepo: IShelterRepository) {}

  async execute(shelterId: string, input: UpdateShelterInput): Promise<ShelterModel> {
    const existing = await this.shelterRepo.getById(shelterId);
    if (!existing) {
      throw new Error(`Shelter with id ${shelterId} not found.`);
    }

    return this.shelterRepo.update(shelterId, input);
  }
}
