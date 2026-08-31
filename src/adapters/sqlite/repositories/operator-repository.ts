import type { IOperatorRepository } from "../../../core/contracts/operator-repository.js";
import type { OperatorProfile } from "../../../core/domain/models.js";
import type { LunaDatabase } from "../database.js";
import * as schema from "../schema.js";
import { eq } from "drizzle-orm";

export class SqliteOperatorRepository implements IOperatorRepository {
  constructor(private readonly db: LunaDatabase) {}

  async getProfile(): Promise<OperatorProfile | null> {
    const rows = await this.db
      .select()
      .from(schema.operatorProfileTable)
      .limit(1);

    if (rows.length === 0) return null;
    const row = rows[0];
    return {
      id: row.id,
      name: row.name,
      email: row.email,
      createdAt: row.createdAt,
      updatedAt: row.updatedAt,
    };
  }

  async saveProfile(
    profile: Omit<OperatorProfile, "createdAt" | "updatedAt">
  ): Promise<OperatorProfile> {
    const now = new Date().toISOString();
    const created: OperatorProfile = {
      ...profile,
      createdAt: now,
      updatedAt: now,
    };

    await this.db.insert(schema.operatorProfileTable).values({
      id: created.id,
      name: created.name,
      email: created.email,
      createdAt: created.createdAt,
      updatedAt: created.updatedAt,
    });

    return created;
  }

  async updateProfile(
    profile: Partial<Omit<OperatorProfile, "id" | "createdAt" | "updatedAt">> & {
      id: string;
    }
  ): Promise<OperatorProfile> {
    const existing = await this.getProfile();
    if (!existing || existing.id !== profile.id) {
      throw new Error(`Operator profile with ID ${profile.id} not found`);
    }

    const now = new Date().toISOString();
    const updated: OperatorProfile = {
      ...existing,
      ...profile,
      updatedAt: now,
    };

    await this.db
      .update(schema.operatorProfileTable)
      .set({
        name: updated.name,
        email: updated.email,
        updatedAt: updated.updatedAt,
      })
      .where(eq(schema.operatorProfileTable.id, profile.id));

    return updated;
  }
}
