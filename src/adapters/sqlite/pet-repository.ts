import { eq, and, isNull } from 'drizzle-orm';
import { IPetRepository, IShelterSession } from '@core/contracts';
import { PetModel, Species, generateUUIDv7 } from '@core/domain';
import { pets } from './schema';
import { BaseScopedRepository } from './base-repository';

export class DrizzlePetRepository extends BaseScopedRepository<PetModel> implements IPetRepository {
  constructor(session: IShelterSession, db: any) {
    super(session, db);
  }

  async getById(id: string): Promise<PetModel | null> {
    const rows = this.db
      .select()
      .from(pets)
      .where(
        and(
          eq(pets.id, id),
          eq(pets.shelterId, this.activeShelterId),
          isNull(pets.deletedAt)
        )
      )
      .all();

    if (rows.length === 0) return null;
    return this.mapToModel(rows[0]);
  }

  async listActive(filters?: { species?: Species; isAvailableForAdoption?: boolean }): Promise<PetModel[]> {
    let conditions = [
      eq(pets.shelterId, this.activeShelterId),
      eq(pets.outcomeStatus, 'ACTIVE'),
      isNull(pets.deletedAt),
    ];

    if (filters?.species) {
      conditions.push(eq(pets.species, filters.species));
    }
    if (filters?.isAvailableForAdoption !== undefined) {
      conditions.push(eq(pets.isAvailableForAdoption, filters.isAvailableForAdoption));
    }

    const rows = this.db
      .select()
      .from(pets)
      .where(and(...conditions))
      .all();

    return rows.map(this.mapToModel);
  }

  async create(data: Omit<PetModel, 'id' | 'shelterId' | 'createdAt' | 'updatedAt' | 'deletedAt'>): Promise<PetModel> {
    const id = generateUUIDv7();
    const now = new Date().toISOString();

    const insertValues = {
      ...data,
      id,
      shelterId: this.activeShelterId,
      healthConditions: JSON.stringify(data.healthConditions || []),
      mediaReferences: JSON.stringify(data.mediaReferences || []),
      createdAt: now,
      updatedAt: now,
      deletedAt: null,
    };

    this.db.insert(pets).values(insertValues).run();

    return {
      ...data,
      id,
      shelterId: this.activeShelterId,
      createdAt: now,
      updatedAt: now,
      deletedAt: null,
    };
  }

  async update(id: string, data: Partial<Omit<PetModel, 'id' | 'shelterId' | 'createdAt'>>): Promise<PetModel> {
    const existing = await this.getById(id);
    if (!existing) {
      throw new Error(`Pet with id ${id} not found in active shelter.`);
    }

    const now = new Date().toISOString();
    const updateValues: any = {
      ...data,
      updatedAt: now,
    };

    if (data.healthConditions !== undefined) {
      updateValues.healthConditions = JSON.stringify(data.healthConditions);
    }
    if (data.mediaReferences !== undefined) {
      updateValues.mediaReferences = JSON.stringify(data.mediaReferences);
    }

    this.db
      .update(pets)
      .set(updateValues)
      .where(and(eq(pets.id, id), eq(pets.shelterId, this.activeShelterId)))
      .run();

    return {
      ...existing,
      ...data,
      updatedAt: now,
    };
  }

  async softDelete(id: string): Promise<void> {
    const now = new Date().toISOString();
    this.db
      .update(pets)
      .set({ deletedAt: now, updatedAt: now })
      .where(and(eq(pets.id, id), eq(pets.shelterId, this.activeShelterId)))
      .run();
  }

  private mapToModel(row: any): PetModel {
    return {
      ...row,
      healthConditions: typeof row.healthConditions === 'string' ? JSON.parse(row.healthConditions || '[]') : [],
      mediaReferences: typeof row.mediaReferences === 'string' ? JSON.parse(row.mediaReferences || '[]') : [],
      isDobEstimated: Boolean(row.isDobEstimated),
      isAvailableForAdoption: Boolean(row.isAvailableForAdoption),
    };
  }
}
