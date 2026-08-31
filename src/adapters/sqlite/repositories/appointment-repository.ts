import type { IAppointmentRepository } from "../../../core/contracts/appointment-repository.js";
import type {
  VetAppointment,
  VetDocument,
} from "../../../core/domain/models.js";
import type { LunaDatabase } from "../database.js";
import * as schema from "../schema.js";
import { and, eq } from "drizzle-orm";

export class SqliteAppointmentRepository implements IAppointmentRepository {
  constructor(private readonly db: LunaDatabase) {}

  async create(
    appointment: Omit<
      VetAppointment,
      "createdAt" | "updatedAt" | "isDeleted" | "deletedAt"
    >
  ): Promise<VetAppointment> {
    const now = new Date().toISOString();
    const created: VetAppointment = {
      ...appointment,
      isDeleted: false,
      deletedAt: null,
      createdAt: now,
      updatedAt: now,
    };

    await this.db.insert(schema.vetAppointmentsTable).values({
      id: created.id,
      shelterId: created.shelterId,
      petId: created.petId,
      clinicId: created.clinicId,
      veterinarianId: created.veterinarianId,
      appointmentDate: created.appointmentDate,
      isRetroactive: created.isRetroactive,
      notes: created.notes,
      isDeleted: false,
      deletedAt: null,
      createdAt: created.createdAt,
      updatedAt: created.updatedAt,
    });

    return created;
  }

  async update(
    appointment: Partial<Omit<VetAppointment, "createdAt" | "updatedAt">> & {
      id: string;
      shelterId: string;
    }
  ): Promise<VetAppointment> {
    const existing = await this.findById(appointment.id, appointment.shelterId);
    if (!existing) {
      throw new Error(
        `Appointment with ID ${appointment.id} not found in shelter ${appointment.shelterId}`
      );
    }

    const now = new Date().toISOString();
    const updated: VetAppointment = {
      ...existing,
      ...appointment,
      updatedAt: now,
    };

    await this.db
      .update(schema.vetAppointmentsTable)
      .set({
        clinicId: updated.clinicId,
        veterinarianId: updated.veterinarianId,
        appointmentDate: updated.appointmentDate,
        isRetroactive: updated.isRetroactive,
        notes: updated.notes,
        updatedAt: updated.updatedAt,
      })
      .where(
        and(
          eq(schema.vetAppointmentsTable.id, appointment.id),
          eq(schema.vetAppointmentsTable.shelterId, appointment.shelterId)
        )
      );

    return updated;
  }

  async findById(
    id: string,
    shelterId: string
  ): Promise<VetAppointment | null> {
    const rows = await this.db
      .select()
      .from(schema.vetAppointmentsTable)
      .where(
        and(
          eq(schema.vetAppointmentsTable.id, id),
          eq(schema.vetAppointmentsTable.shelterId, shelterId)
        )
      )
      .limit(1);

    if (rows.length === 0) return null;
    return this.mapAppointmentRow(rows[0]);
  }

  async listByPet(
    petId: string,
    shelterId: string
  ): Promise<VetAppointment[]> {
    const rows = await this.db
      .select()
      .from(schema.vetAppointmentsTable)
      .where(
        and(
          eq(schema.vetAppointmentsTable.petId, petId),
          eq(schema.vetAppointmentsTable.shelterId, shelterId),
          eq(schema.vetAppointmentsTable.isDeleted, false)
        )
      );

    return rows.map((row) => this.mapAppointmentRow(row));
  }

  async softDelete(id: string, shelterId: string): Promise<boolean> {
    const existing = await this.findById(id, shelterId);
    if (!existing || existing.isDeleted) return false;

    const now = new Date().toISOString();
    await this.db
      .update(schema.vetAppointmentsTable)
      .set({
        isDeleted: true,
        deletedAt: now,
        updatedAt: now,
      })
      .where(
        and(
          eq(schema.vetAppointmentsTable.id, id),
          eq(schema.vetAppointmentsTable.shelterId, shelterId)
        )
      );

    return true;
  }

  async addDocument(doc: Omit<VetDocument, "createdAt">): Promise<VetDocument> {
    const now = new Date().toISOString();
    const created: VetDocument = {
      ...doc,
      createdAt: now,
    };

    await this.db.insert(schema.vetDocumentsTable).values({
      id: created.id,
      shelterId: created.shelterId,
      appointmentId: created.appointmentId,
      fileName: created.fileName,
      filePath: created.filePath,
      mimeType: created.mimeType,
      fileSizeBytes: created.fileSizeBytes,
      createdAt: created.createdAt,
    });

    return created;
  }

  async getDocuments(
    appointmentId: string,
    shelterId: string
  ): Promise<VetDocument[]> {
    const rows = await this.db
      .select()
      .from(schema.vetDocumentsTable)
      .where(
        and(
          eq(schema.vetDocumentsTable.appointmentId, appointmentId),
          eq(schema.vetDocumentsTable.shelterId, shelterId)
        )
      );

    return rows.map((row) => ({
      id: row.id,
      shelterId: row.shelterId,
      appointmentId: row.appointmentId,
      fileName: row.fileName,
      filePath: row.filePath,
      mimeType: row.mimeType,
      fileSizeBytes: row.fileSizeBytes,
      createdAt: row.createdAt,
    }));
  }

  async deleteDocument(
    docId: string,
    appointmentId: string,
    shelterId: string
  ): Promise<boolean> {
    const rows = await this.db
      .select()
      .from(schema.vetDocumentsTable)
      .where(
        and(
          eq(schema.vetDocumentsTable.id, docId),
          eq(schema.vetDocumentsTable.appointmentId, appointmentId),
          eq(schema.vetDocumentsTable.shelterId, shelterId)
        )
      )
      .limit(1);

    if (rows.length === 0) return false;

    await this.db
      .delete(schema.vetDocumentsTable)
      .where(
        and(
          eq(schema.vetDocumentsTable.id, docId),
          eq(schema.vetDocumentsTable.appointmentId, appointmentId),
          eq(schema.vetDocumentsTable.shelterId, shelterId)
        )
      );

    return true;
  }

  private mapAppointmentRow(
    row: typeof schema.vetAppointmentsTable.$inferSelect
  ): VetAppointment {
    return {
      id: row.id,
      shelterId: row.shelterId,
      petId: row.petId,
      clinicId: row.clinicId,
      veterinarianId: row.veterinarianId,
      appointmentDate: row.appointmentDate,
      isRetroactive: Boolean(row.isRetroactive),
      notes: row.notes,
      isDeleted: Boolean(row.isDeleted),
      deletedAt: row.deletedAt,
      createdAt: row.createdAt,
      updatedAt: row.updatedAt,
    };
  }
}
