import { eq } from 'drizzle-orm';
import { IShelterRepository } from '@core/contracts';
import { ShelterModel, generateUUIDv7 } from '@core/domain';
import { shelters } from './schema';

export class DrizzleShelterRepository implements IShelterRepository {
  constructor(private readonly db: any) {}

  async getById(id: string): Promise<ShelterModel | null> {
    const rows = this.db.select().from(shelters).where(eq(shelters.id, id)).all();
    if (rows.length === 0) return null;
    return {
      ...rows[0],
      isActive: Boolean(rows[0].isActive),
    };
  }

  async listAll(): Promise<ShelterModel[]> {
    const rows = this.db.select().from(shelters).all();
    return rows.map((r: any) => ({
      ...r,
      isActive: Boolean(r.isActive),
    }));
  }

  async create(data: Omit<ShelterModel, 'id' | 'createdAt' | 'updatedAt'>): Promise<ShelterModel> {
    const id = generateUUIDv7();
    const now = new Date().toISOString();
    const newShelter = {
      ...data,
      id,
      createdAt: now,
      updatedAt: now,
    };

    this.db.insert(shelters).values(newShelter).run();
    return {
      ...newShelter,
      isActive: Boolean(newShelter.isActive),
    };
  }

  async update(id: string, data: Partial<Omit<ShelterModel, 'id' | 'createdAt'>>): Promise<ShelterModel> {
    const existing = await this.getById(id);
    if (!existing) {
      throw new Error(`Shelter with id ${id} not found.`);
    }

    const now = new Date().toISOString();
    this.db
      .update(shelters)
      .set({ ...data, updatedAt: now })
      .where(eq(shelters.id, id))
      .run();

    return {
      ...existing,
      ...data,
      updatedAt: now,
    };
  }
}
