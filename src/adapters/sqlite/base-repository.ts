import { IShelterSession } from '@core/contracts';

export abstract class BaseScopedRepository<TEntity extends { shelterId: string }> {
  protected constructor(
    protected readonly session: IShelterSession,
    protected readonly db: any
  ) {
    if (!session || !session.activeShelterId || session.activeShelterId.trim() === '') {
      throw new Error('[TENANT_ISOLATION_VIOLATION] Attempted repository operation without an active shelter context.');
    }
  }

  protected get activeShelterId(): string {
    return this.session.activeShelterId;
  }

  protected enforceTenantOwnership(entity: Partial<TEntity>): void {
    if (entity.shelterId && entity.shelterId !== this.session.activeShelterId) {
      throw new Error(
        `[CROSS_TENANT_MUTATION_BLOCKED] Entity shelterId ${entity.shelterId} does not match active session ${this.session.activeShelterId}`
      );
    }
  }
}
