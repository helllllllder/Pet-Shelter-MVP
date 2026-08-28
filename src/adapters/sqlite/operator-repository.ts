import { eq } from 'drizzle-orm';
import { IOperatorRepository } from '@core/contracts';
import { OperatorProfileModel, generateUUIDv7 } from '@core/domain';
import { operatorProfile } from './schema';

export class DrizzleOperatorRepository implements IOperatorRepository {
  constructor(private readonly db: any) {}

  async getProfile(): Promise<OperatorProfileModel | null> {
    const rows = this.db.select().from(operatorProfile).all();
    if (rows.length === 0) return null;
    return rows[0];
  }

  async createProfile(data: Omit<OperatorProfileModel, 'createdAt' | 'updatedAt'>): Promise<OperatorProfileModel> {
    const now = new Date().toISOString();
    const newProfile = {
      ...data,
      createdAt: now,
      updatedAt: now,
    };

    this.db.insert(operatorProfile).values(newProfile).run();
    return newProfile;
  }

  async updateLastActiveShelter(shelterId: string): Promise<void> {
    const now = new Date().toISOString();
    const profile = await this.getProfile();
    if (profile) {
      this.db
        .update(operatorProfile)
        .set({ lastActiveShelterId: shelterId, updatedAt: now })
        .where(eq(operatorProfile.id, profile.id))
        .run();
    }
  }
}
