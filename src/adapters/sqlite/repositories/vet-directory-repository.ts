import type { IVetDirectoryRepository } from "../../../core/contracts/vet-directory-repository.js";
import type { VetClinic, Veterinarian } from "../../../core/domain/models.js";
import type { LunaDatabase } from "../database.js";
import * as schema from "../schema.js";
import { and, eq, like, sql } from "drizzle-orm";

export class SqliteVetDirectoryRepository implements IVetDirectoryRepository {
  constructor(private readonly db: LunaDatabase) {}

  async createClinic(
    clinic: Omit<VetClinic, "createdAt" | "updatedAt" | "isDeleted" | "deletedAt">
  ): Promise<VetClinic> {
    const now = new Date().toISOString();
    const created: VetClinic = {
      ...clinic,
      isDeleted: false,
      deletedAt: null,
      createdAt: now,
      updatedAt: now,
    };

    await this.db.insert(schema.vetClinicsTable).values({
      id: created.id,
      shelterId: created.shelterId,
      name: created.name,
      address: created.address,
      phone: created.phone,
      email: created.email,
      isDeleted: false,
      deletedAt: null,
      createdAt: created.createdAt,
      updatedAt: created.updatedAt,
    });

    return created;
  }

  async updateClinic(
    clinic: Partial<Omit<VetClinic, "createdAt" | "updatedAt">> & {
      id: string;
      shelterId: string;
    }
  ): Promise<VetClinic> {
    const existing = await this.findClinicById(clinic.id, clinic.shelterId);
    if (!existing) {
      throw new Error(
        `Clinic with ID ${clinic.id} not found in shelter ${clinic.shelterId}`
      );
    }

    const now = new Date().toISOString();
    const updated: VetClinic = {
      ...existing,
      ...clinic,
      updatedAt: now,
    };

    await this.db
      .update(schema.vetClinicsTable)
      .set({
        name: updated.name,
        address: updated.address,
        phone: updated.phone,
        email: updated.email,
        updatedAt: updated.updatedAt,
      })
      .where(
        and(
          eq(schema.vetClinicsTable.id, clinic.id),
          eq(schema.vetClinicsTable.shelterId, clinic.shelterId)
        )
      );

    return updated;
  }

  async findClinicById(
    id: string,
    shelterId: string
  ): Promise<VetClinic | null> {
    const rows = await this.db
      .select()
      .from(schema.vetClinicsTable)
      .where(
        and(
          eq(schema.vetClinicsTable.id, id),
          eq(schema.vetClinicsTable.shelterId, shelterId)
        )
      )
      .limit(1);

    if (rows.length === 0) return null;
    return this.mapClinicRow(rows[0]);
  }

  async listClinics(
    shelterId: string,
    includeDeleted: boolean = false
  ): Promise<VetClinic[]> {
    const conditions = [eq(schema.vetClinicsTable.shelterId, shelterId)];
    if (!includeDeleted) {
      conditions.push(eq(schema.vetClinicsTable.isDeleted, false));
    }

    const rows = await this.db
      .select()
      .from(schema.vetClinicsTable)
      .where(and(...conditions));

    return rows.map((row) => this.mapClinicRow(row));
  }

  async searchClinics(shelterId: string, query: string): Promise<VetClinic[]> {
    const conditions = [
      eq(schema.vetClinicsTable.shelterId, shelterId),
      eq(schema.vetClinicsTable.isDeleted, false),
    ];

    if (query.trim().length > 0) {
      conditions.push(
        like(
          sql`lower(${schema.vetClinicsTable.name})`,
          `%${query.toLowerCase()}%`
        )
      );
    }

    const rows = await this.db
      .select()
      .from(schema.vetClinicsTable)
      .where(and(...conditions));

    return rows.map((row) => this.mapClinicRow(row));
  }

  async softDeleteClinic(id: string, shelterId: string): Promise<boolean> {
    const existing = await this.findClinicById(id, shelterId);
    if (!existing || existing.isDeleted) return false;

    const now = new Date().toISOString();
    await this.db
      .update(schema.vetClinicsTable)
      .set({
        isDeleted: true,
        deletedAt: now,
        updatedAt: now,
      })
      .where(
        and(
          eq(schema.vetClinicsTable.id, id),
          eq(schema.vetClinicsTable.shelterId, shelterId)
        )
      );

    return true;
  }

  async createVeterinarian(
    vet: Omit<
      Veterinarian,
      "createdAt" | "updatedAt" | "isDeleted" | "deletedAt"
    >
  ): Promise<Veterinarian> {
    const now = new Date().toISOString();
    const created: Veterinarian = {
      ...vet,
      isDeleted: false,
      deletedAt: null,
      createdAt: now,
      updatedAt: now,
    };

    await this.db.insert(schema.veterinariansTable).values({
      id: created.id,
      shelterId: created.shelterId,
      clinicId: created.clinicId,
      name: created.name,
      specialization: created.specialization,
      phone: created.phone,
      email: created.email,
      isDeleted: false,
      deletedAt: null,
      createdAt: created.createdAt,
      updatedAt: created.updatedAt,
    });

    return created;
  }

  async updateVeterinarian(
    vet: Partial<Omit<Veterinarian, "createdAt" | "updatedAt">> & {
      id: string;
      shelterId: string;
    }
  ): Promise<Veterinarian> {
    const existing = await this.findVeterinarianById(vet.id, vet.shelterId);
    if (!existing) {
      throw new Error(
        `Veterinarian with ID ${vet.id} not found in shelter ${vet.shelterId}`
      );
    }

    const now = new Date().toISOString();
    const updated: Veterinarian = {
      ...existing,
      ...vet,
      updatedAt: now,
    };

    await this.db
      .update(schema.veterinariansTable)
      .set({
        name: updated.name,
        specialization: updated.specialization,
        phone: updated.phone,
        email: updated.email,
        updatedAt: updated.updatedAt,
      })
      .where(
        and(
          eq(schema.veterinariansTable.id, vet.id),
          eq(schema.veterinariansTable.shelterId, vet.shelterId)
        )
      );

    return updated;
  }

  async findVeterinarianById(
    id: string,
    shelterId: string
  ): Promise<Veterinarian | null> {
    const rows = await this.db
      .select()
      .from(schema.veterinariansTable)
      .where(
        and(
          eq(schema.veterinariansTable.id, id),
          eq(schema.veterinariansTable.shelterId, shelterId)
        )
      )
      .limit(1);

    if (rows.length === 0) return null;
    return this.mapVetRow(rows[0]);
  }

  async listVeterinariansByClinic(
    clinicId: string,
    shelterId: string,
    includeDeleted: boolean = false
  ): Promise<Veterinarian[]> {
    const conditions = [
      eq(schema.veterinariansTable.shelterId, shelterId),
      eq(schema.veterinariansTable.clinicId, clinicId),
    ];
    if (!includeDeleted) {
      conditions.push(eq(schema.veterinariansTable.isDeleted, false));
    }

    const rows = await this.db
      .select()
      .from(schema.veterinariansTable)
      .where(and(...conditions));

    return rows.map((row) => this.mapVetRow(row));
  }

  async softDeleteVeterinarian(
    id: string,
    shelterId: string
  ): Promise<boolean> {
    const existing = await this.findVeterinarianById(id, shelterId);
    if (!existing || existing.isDeleted) return false;

    const now = new Date().toISOString();
    await this.db
      .update(schema.veterinariansTable)
      .set({
        isDeleted: true,
        deletedAt: now,
        updatedAt: now,
      })
      .where(
        and(
          eq(schema.veterinariansTable.id, id),
          eq(schema.veterinariansTable.shelterId, shelterId)
        )
      );

    return true;
  }

  private mapClinicRow(
    row: typeof schema.vetClinicsTable.$inferSelect
  ): VetClinic {
    return {
      id: row.id,
      shelterId: row.shelterId,
      name: row.name,
      address: row.address,
      phone: row.phone,
      email: row.email,
      isDeleted: Boolean(row.isDeleted),
      deletedAt: row.deletedAt,
      createdAt: row.createdAt,
      updatedAt: row.updatedAt,
    };
  }

  private mapVetRow(
    row: typeof schema.veterinariansTable.$inferSelect
  ): Veterinarian {
    return {
      id: row.id,
      shelterId: row.shelterId,
      clinicId: row.clinicId,
      name: row.name,
      specialization: row.specialization,
      phone: row.phone,
      email: row.email,
      isDeleted: Boolean(row.isDeleted),
      deletedAt: row.deletedAt,
      createdAt: row.createdAt,
      updatedAt: row.updatedAt,
    };
  }
}
