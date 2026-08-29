import { IShelterRepository, IOperatorRepository } from '@core/contracts';
import { ShelterModel } from '@core/domain';
import { ShelterSchema } from '@core/schemas';
import { generateUUIDv7 } from '@core/domain';

export interface CreateShelterInput {
  name: string;
  description?: string | null;
  address?: string | null;
  phone?: string | null;
  email?: string | null;
}

export class CreateShelterUseCase {
  constructor(
    private readonly shelterRepo: IShelterRepository,
    private readonly operatorRepo: IOperatorRepository
  ) {}

  async execute(input: CreateShelterInput): Promise<ShelterModel> {
    const id = generateUUIDv7();
    const now = new Date().toISOString();

    const candidate = {
      id,
      name: input.name?.trim() || '',
      description: input.description ? input.description.trim() : null,
      address: input.address ? input.address.trim() : null,
      phone: input.phone ? input.phone.trim() : null,
      email: input.email ? input.email.trim().toLowerCase() : null,
      isActive: true,
      createdAt: now,
      updatedAt: now,
    };

    const validated = ShelterSchema.parse(candidate);

    const created = await this.shelterRepo.create({
      name: validated.name,
      description: validated.description ?? null,
      address: validated.address ?? null,
      phone: validated.phone ?? null,
      email: validated.email ?? null,
      isActive: validated.isActive,
    });

    // Auto-select rule: If operator profile has no active shelter, auto-set this one (TC-FR02-01)
    const profile = await this.operatorRepo.getProfile();
    if (profile && !profile.lastActiveShelterId) {
      await this.operatorRepo.updateLastActiveShelter(created.id);
    }

    return created;
  }
}
