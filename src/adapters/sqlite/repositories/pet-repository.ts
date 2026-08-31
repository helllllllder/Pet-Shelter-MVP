import type {
  IPetRepository,
  PetSearchFilter,
} from "../../../core/contracts/pet-repository.js";
import type {
  Pet,
  PetMedia,
  AdopterDetails,
} from "../../../core/domain/models.js";
import type { LunaDatabase } from "../database.js";
import * as schema from "../schema.js";
import { and, eq, like, sql } from "drizzle-orm";

export class SqlitePetRepository implements IPetRepository {
  constructor(private readonly db: LunaDatabase) {}

  async create(pet: Omit<Pet, "createdAt" | "updatedAt">): Promise<Pet> {
    const now = new Date().toISOString();
    const created: Pet = {
      ...pet,
      createdAt: now,
      updatedAt: now,
    };

    await this.db.insert(schema.petsTable).values({
      id: created.id,
      shelterId: created.shelterId,
      name: created.name,
      dob: created.dob,
      isDobEstimated: created.isDobEstimated,
      species: created.species,
      breed: created.breed,
      sex: created.sex,
      color: created.color,
      intakeOrigin: created.intakeOrigin,
      intakeOriginDetail: created.intakeOriginDetail,
      healthConditions: created.healthConditions,
      healthStatus: created.healthStatus,
      availableForAdoption: created.availableForAdoption,
      outcomeStatus: created.outcomeStatus,
      outcomeDate: created.outcomeDate,
      isArchived: created.isArchived,
      createdAt: created.createdAt,
      updatedAt: created.updatedAt,
    });

    return created;
  }

  async update(
    pet: Partial<Omit<Pet, "createdAt" | "updatedAt">> & {
      id: string;
      shelterId: string;
    }
  ): Promise<Pet> {
    const existing = await this.findById(pet.id, pet.shelterId);
    if (!existing) {
      throw new Error(
        `Pet with ID ${pet.id} not found in shelter ${pet.shelterId}`
      );
    }

    const now = new Date().toISOString();
    const updated: Pet = {
      ...existing,
      ...pet,
      updatedAt: now,
    };

    await this.db
      .update(schema.petsTable)
      .set({
        name: updated.name,
        dob: updated.dob,
        isDobEstimated: updated.isDobEstimated,
        species: updated.species,
        breed: updated.breed,
        sex: updated.sex,
        color: updated.color,
        intakeOrigin: updated.intakeOrigin,
        intakeOriginDetail: updated.intakeOriginDetail,
        healthConditions: updated.healthConditions,
        healthStatus: updated.healthStatus,
        availableForAdoption: updated.availableForAdoption,
        outcomeStatus: updated.outcomeStatus,
        outcomeDate: updated.outcomeDate,
        isArchived: updated.isArchived,
        updatedAt: updated.updatedAt,
      })
      .where(
        and(
          eq(schema.petsTable.id, pet.id),
          eq(schema.petsTable.shelterId, pet.shelterId)
        )
      );

    return updated;
  }

  async findById(id: string, shelterId: string): Promise<Pet | null> {
    const rows = await this.db
      .select()
      .from(schema.petsTable)
      .where(
        and(
          eq(schema.petsTable.id, id),
          eq(schema.petsTable.shelterId, shelterId)
        )
      )
      .limit(1);

    if (rows.length === 0) return null;
    return this.mapPetRow(rows[0]);
  }

  async search(shelterId: string, filter?: PetSearchFilter): Promise<Pet[]> {
    const conditions = [eq(schema.petsTable.shelterId, shelterId)];

    if (filter?.query && filter.query.trim().length > 0) {
      conditions.push(
        like(sql`lower(${schema.petsTable.name})`, `%${filter.query.toLowerCase()}%`)
      );
    }

    if (filter?.species) {
      conditions.push(eq(schema.petsTable.species, filter.species));
    }

    if (filter?.outcomeStatus !== undefined) {
      if (filter.outcomeStatus === null) {
        conditions.push(sql`${schema.petsTable.outcomeStatus} IS NULL`);
      } else {
        conditions.push(eq(schema.petsTable.outcomeStatus, filter.outcomeStatus));
      }
    }

    if (filter?.availableForAdoption !== undefined) {
      conditions.push(
        eq(schema.petsTable.availableForAdoption, filter.availableForAdoption)
      );
    }

    if (filter?.isArchived !== undefined) {
      conditions.push(eq(schema.petsTable.isArchived, filter.isArchived));
    }

    const rows = await this.db
      .select()
      .from(schema.petsTable)
      .where(and(...conditions));

    return rows.map((row) => this.mapPetRow(row));
  }

  async delete(id: string, shelterId: string): Promise<boolean> {
    const existing = await this.findById(id, shelterId);
    if (!existing || existing.isArchived) {
      return false;
    }

    const result = await this.db
      .delete(schema.petsTable)
      .where(
        and(
          eq(schema.petsTable.id, id),
          eq(schema.petsTable.shelterId, shelterId)
        )
      );

    return true;
  }

  async addMedia(media: Omit<PetMedia, "createdAt">): Promise<PetMedia> {
    const now = new Date().toISOString();
    const created: PetMedia = {
      ...media,
      createdAt: now,
    };

    await this.db.insert(schema.petMediaTable).values({
      id: created.id,
      shelterId: created.shelterId,
      petId: created.petId,
      mediaType: created.mediaType,
      filePath: created.filePath,
      mimeType: created.mimeType,
      fileSizeBytes: created.fileSizeBytes,
      createdAt: created.createdAt,
    });

    return created;
  }

  async getMedia(petId: string, shelterId: string): Promise<PetMedia[]> {
    const rows = await this.db
      .select()
      .from(schema.petMediaTable)
      .where(
        and(
          eq(schema.petMediaTable.petId, petId),
          eq(schema.petMediaTable.shelterId, shelterId)
        )
      );

    return rows.map((row) => ({
      id: row.id,
      shelterId: row.shelterId,
      petId: row.petId,
      mediaType: row.mediaType as PetMedia["mediaType"],
      filePath: row.filePath,
      mimeType: row.mimeType,
      fileSizeBytes: row.fileSizeBytes,
      createdAt: row.createdAt,
    }));
  }

  async deleteMedia(
    mediaId: string,
    petId: string,
    shelterId: string
  ): Promise<boolean> {
    const rows = await this.db
      .select()
      .from(schema.petMediaTable)
      .where(
        and(
          eq(schema.petMediaTable.id, mediaId),
          eq(schema.petMediaTable.petId, petId),
          eq(schema.petMediaTable.shelterId, shelterId)
        )
      )
      .limit(1);

    if (rows.length === 0) return false;

    await this.db
      .delete(schema.petMediaTable)
      .where(
        and(
          eq(schema.petMediaTable.id, mediaId),
          eq(schema.petMediaTable.petId, petId),
          eq(schema.petMediaTable.shelterId, shelterId)
        )
      );

    return true;
  }

  async saveAdopterDetails(
    details: Omit<AdopterDetails, "createdAt" | "updatedAt">
  ): Promise<AdopterDetails> {
    const now = new Date().toISOString();
    const created: AdopterDetails = {
      ...details,
      createdAt: now,
      updatedAt: now,
    };

    await this.db.insert(schema.adopterDetailsTable).values({
      id: created.id,
      shelterId: created.shelterId,
      petId: created.petId,
      name: created.name,
      phone: created.phone,
      address: created.address,
      createdAt: created.createdAt,
      updatedAt: created.updatedAt,
    });

    return created;
  }

  async getAdopterDetails(
    petId: string,
    shelterId: string
  ): Promise<AdopterDetails | null> {
    const rows = await this.db
      .select()
      .from(schema.adopterDetailsTable)
      .where(
        and(
          eq(schema.adopterDetailsTable.petId, petId),
          eq(schema.adopterDetailsTable.shelterId, shelterId)
        )
      )
      .limit(1);

    if (rows.length === 0) return null;
    const row = rows[0];
    return {
      id: row.id,
      shelterId: row.shelterId,
      petId: row.petId,
      name: row.name,
      phone: row.phone,
      address: row.address,
      createdAt: row.createdAt,
      updatedAt: row.updatedAt,
    };
  }

  private mapPetRow(row: typeof schema.petsTable.$inferSelect): Pet {
    return {
      id: row.id,
      shelterId: row.shelterId,
      name: row.name,
      dob: row.dob,
      isDobEstimated: Boolean(row.isDobEstimated),
      species: row.species,
      breed: row.breed,
      sex: row.sex as Pet["sex"],
      color: row.color,
      intakeOrigin: row.intakeOrigin as Pet["intakeOrigin"],
      intakeOriginDetail: row.intakeOriginDetail,
      healthConditions: row.healthConditions,
      healthStatus: row.healthStatus as Pet["healthStatus"],
      availableForAdoption: Boolean(row.availableForAdoption),
      outcomeStatus: row.outcomeStatus as Pet["outcomeStatus"],
      outcomeDate: row.outcomeDate,
      isArchived: Boolean(row.isArchived),
      createdAt: row.createdAt,
      updatedAt: row.updatedAt,
    };
  }
}
