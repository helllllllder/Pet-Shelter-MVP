import { IShelterSession, IPetRepository, IOperatorRepository, IShelterRepository, IVetDirectoryRepository, ICareEventRepository } from '@core/contracts';
import { DrizzlePetRepository } from './pet-repository';
import { DrizzleOperatorRepository } from './operator-repository';
import { DrizzleShelterRepository } from './shelter-repository';
import { DrizzleVetDirectoryRepository } from './vet-directory-repository';
import { DrizzleCareEventRepository } from './care-event-repository';

export class ScopedRepositoryFactory {
  constructor(private readonly db: any) {}

  createSession(activeShelterId: string, operatorId: string = 'local-operator'): IShelterSession {
    if (!activeShelterId || activeShelterId.trim() === '') {
      throw new Error('[TENANT_ISOLATION_VIOLATION] Cannot create session with empty shelter ID.');
    }
    return {
      activeShelterId,
      operatorId,
    };
  }

  getOperatorRepository(): IOperatorRepository {
    return new DrizzleOperatorRepository(this.db);
  }

  getShelterRepository(): IShelterRepository {
    return new DrizzleShelterRepository(this.db);
  }

  getPetRepository(session: IShelterSession): IPetRepository {
    return new DrizzlePetRepository(session, this.db);
  }

  getVetDirectoryRepository(session: IShelterSession): DrizzleVetDirectoryRepository {
    return new DrizzleVetDirectoryRepository(session, this.db);
  }

  getCareEventRepository(session: IShelterSession): ICareEventRepository {
    return new DrizzleCareEventRepository(session, this.db);
  }
}
