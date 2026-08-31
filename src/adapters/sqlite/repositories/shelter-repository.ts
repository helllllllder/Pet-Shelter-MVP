import type { IShelterRepository } from "../../../core/contracts/shelter-repository.js";
import type { Shelter } from "../../../core/domain/models.js";
import type { LunaDatabase } from "../database.js";
import * as schema from "../schema.js";
import { eq } from "drizzle-orm";

export class SqliteShelterRepository implements IShelterRepository {
  constructor(private readonly db: LunaDatabase) {}

  async create(
    shelter: Omit<Shelter, "createdAt" | "updatedAt">
  ): Promise<Shelter> {
    const now = new Date().toISOString();
    const created: Shelter = {
      ...shelter,
      createdAt: now,
      updatedAt: now,
    };

    await this.db.insert(schema.sheltersTable).values({
      id: created.id,
      name: created.name,
      description: created.description,
      isActive: created.isActive,
      createdAt: created.createdAt,
      updatedAt: created.updatedAt,
    });

    return created;
  }

  async update(
    shelter: Partial<Omit<Shelter, "createdAt" | "updatedAt">> & {
      id: string;
    }
  ): Promise<Shelter> {
    const existing = await this.findById(shelter.id);
    if (!existing) {
      throw new Error(`Shelter with ID ${shelter.id} not found`);
    }

    const now = new Date().toISOString();
    const updated: Shelter = {
      ...existing,
      ...shelter,
      updatedAt: now,
    };

    await this.db
      .update(schema.sheltersTable)
      .set({
        name: updated.name,
        description: updated.description,
        isActive: updated.isActive,
        updatedAt: updated.updatedAt,
      })
      .where(eq(schema.sheltersTable.id, shelter.id));

    return updated;
  }

  async findById(id: string): Promise<Shelter | null> {
    const rows = await this.db
      .select()
      .from(schema.sheltersTable)
      .where(eq(schema.sheltersTable.id, id))
      .limit(1);

    if (rows.length === 0) return null;
    const row = rows[0];
    return {
      id: row.id,
      name: row.name,
      description: row.description,
      isActive: row.isActive,
      createdAt: row.createdAt,
      updatedAt: row.updatedAt,
    };
  }

  async listAll(): Promise<Shelter[]> {
    const rows = await this.db.select().from(schema.sheltersTable);
    return rows.map((row) => ({
      id: row.id,
      name: row.name,
      description: row.description,
      isActive: row.isActive,
      createdAt: row.createdAt,
      updatedAt: row.updatedAt,
    }));
  }
}
