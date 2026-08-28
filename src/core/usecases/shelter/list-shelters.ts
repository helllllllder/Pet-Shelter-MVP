import { IShelterRepository } from '@core/contracts';
import { ShelterModel } from '@core/domain';

export class ListSheltersUseCase {
  constructor(private readonly shelterRepo: IShelterRepository) {}

  async execute(): Promise<ShelterModel[]> {
    return this.shelterRepo.listAll();
  }
}
