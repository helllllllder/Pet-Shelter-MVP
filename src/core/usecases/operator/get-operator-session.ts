import { IOperatorRepository } from '@core/contracts';
import { OperatorProfileModel } from '@core/domain';

export class GetOperatorSessionUseCase {
  constructor(private readonly operatorRepo: IOperatorRepository) {}

  async execute(): Promise<{ isRegistered: boolean; profile: OperatorProfileModel | null }> {
    const profile = await this.operatorRepo.getProfile();
    return {
      isRegistered: profile !== null,
      profile,
    };
  }
}
