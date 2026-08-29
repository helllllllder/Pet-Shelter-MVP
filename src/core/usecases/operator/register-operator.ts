import { IOperatorRepository } from '@core/contracts';
import { OperatorProfileModel, generateUUIDv7 } from '@core/domain';
import { OperatorProfileSchema } from '@core/schemas';

export interface RegisterOperatorInput {
  fullName: string;
  email: string;
  phone?: string | null;
  deviceInstallId?: string;
}

export class RegisterOperatorUseCase {
  constructor(private readonly operatorRepo: IOperatorRepository) {}

  async execute(input: RegisterOperatorInput): Promise<OperatorProfileModel> {
    const existing = await this.operatorRepo.getProfile();
    if (existing) {
      throw new Error('[OPERATOR_ALREADY_REGISTERED] A local operator profile already exists on this device.');
    }

    const id = generateUUIDv7();
    const now = new Date().toISOString();
    const deviceInstallId = input.deviceInstallId || generateUUIDv7();

    const candidate = {
      id,
      fullName: input.fullName?.trim() || '',
      email: input.email?.trim().toLowerCase() || '',
      phone: input.phone ? input.phone.trim() : null,
      lastActiveShelterId: null,
      deviceInstallId,
      createdAt: now,
      updatedAt: now,
    };

    const validated = OperatorProfileSchema.parse(candidate);

    return this.operatorRepo.createProfile({
      id: validated.id,
      fullName: validated.fullName,
      email: validated.email,
      phone: validated.phone ?? null,
      lastActiveShelterId: validated.lastActiveShelterId ?? null,
      deviceInstallId: validated.deviceInstallId,
    });
  }
}
