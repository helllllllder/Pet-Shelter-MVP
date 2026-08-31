import type { ICareEventRepository } from "../../../core/contracts/care-event-repository.js";
import type {
  CareEvent,
  CareEventOccurrence,
  CareOccurrenceStatus,
} from "../../../core/domain/models.js";
import type { LunaDatabase } from "../database.js";
import * as schema from "../schema.js";
import { and, eq, lte, sql } from "drizzle-orm";

export class SqliteCareEventRepository implements ICareEventRepository {
  constructor(private readonly db: LunaDatabase) {}

  async create(
    event: Omit<CareEvent, "createdAt" | "updatedAt">
  ): Promise<CareEvent> {
    const now = new Date().toISOString();
    const created: CareEvent = {
      ...event,
      createdAt: now,
      updatedAt: now,
    };

    await this.db.insert(schema.careEventsTable).values({
      id: created.id,
      shelterId: created.shelterId,
      petId: created.petId,
      appointmentId: created.appointmentId,
      modality: created.modality,
      substance: created.substance,
      instructions: created.instructions,
      isRecurring: created.isRecurring,
      recurrenceIntervalValue: created.recurrenceIntervalValue,
      recurrenceIntervalUnit: created.recurrenceIntervalUnit,
      isTemporary: created.isTemporary,
      startDate: created.startDate,
      endDate: created.endDate,
      status: created.status,
      createdAt: created.createdAt,
      updatedAt: created.updatedAt,
    });

    return created;
  }

  async update(
    event: Partial<Omit<CareEvent, "createdAt" | "updatedAt">> & {
      id: string;
      shelterId: string;
    }
  ): Promise<CareEvent> {
    const existing = await this.findById(event.id, event.shelterId);
    if (!existing) {
      throw new Error(
        `Care event with ID ${event.id} not found in shelter ${event.shelterId}`
      );
    }

    const now = new Date().toISOString();
    const updated: CareEvent = {
      ...existing,
      ...event,
      updatedAt: now,
    };

    await this.db
      .update(schema.careEventsTable)
      .set({
        appointmentId: updated.appointmentId,
        modality: updated.modality,
        substance: updated.substance,
        instructions: updated.instructions,
        isRecurring: updated.isRecurring,
        recurrenceIntervalValue: updated.recurrenceIntervalValue,
        recurrenceIntervalUnit: updated.recurrenceIntervalUnit,
        isTemporary: updated.isTemporary,
        startDate: updated.startDate,
        endDate: updated.endDate,
        status: updated.status,
        updatedAt: updated.updatedAt,
      })
      .where(
        and(
          eq(schema.careEventsTable.id, event.id),
          eq(schema.careEventsTable.shelterId, event.shelterId)
        )
      );

    return updated;
  }

  async findById(id: string, shelterId: string): Promise<CareEvent | null> {
    const rows = await this.db
      .select()
      .from(schema.careEventsTable)
      .where(
        and(
          eq(schema.careEventsTable.id, id),
          eq(schema.careEventsTable.shelterId, shelterId)
        )
      )
      .limit(1);

    if (rows.length === 0) return null;
    return this.mapCareEventRow(rows[0]);
  }

  async listByPet(petId: string, shelterId: string): Promise<CareEvent[]> {
    const rows = await this.db
      .select()
      .from(schema.careEventsTable)
      .where(
        and(
          eq(schema.careEventsTable.petId, petId),
          eq(schema.careEventsTable.shelterId, shelterId)
        )
      );

    return rows.map((row) => this.mapCareEventRow(row));
  }

  async delete(id: string, shelterId: string): Promise<boolean> {
    const existing = await this.findById(id, shelterId);
    if (!existing) return false;

    await this.db
      .delete(schema.careEventsTable)
      .where(
        and(
          eq(schema.careEventsTable.id, id),
          eq(schema.careEventsTable.shelterId, shelterId)
        )
      );

    return true;
  }

  async createOccurrences(
    occurrences: Omit<CareEventOccurrence, "createdAt" | "updatedAt">[]
  ): Promise<CareEventOccurrence[]> {
    const now = new Date().toISOString();
    const createdList: CareEventOccurrence[] = occurrences.map((occ) => ({
      ...occ,
      createdAt: now,
      updatedAt: now,
    }));

    if (createdList.length > 0) {
      await this.db.insert(schema.careEventOccurrencesTable).values(
        createdList.map((occ) => ({
          id: occ.id,
          shelterId: occ.shelterId,
          careEventId: occ.careEventId,
          petId: occ.petId,
          dueDate: occ.dueDate,
          status: occ.status,
          completedAt: occ.completedAt,
          notes: occ.notes,
          createdAt: occ.createdAt,
          updatedAt: occ.updatedAt,
        }))
      );
    }

    return createdList;
  }

  async listOccurrencesByPet(
    petId: string,
    shelterId: string
  ): Promise<CareEventOccurrence[]> {
    const rows = await this.db
      .select()
      .from(schema.careEventOccurrencesTable)
      .where(
        and(
          eq(schema.careEventOccurrencesTable.petId, petId),
          eq(schema.careEventOccurrencesTable.shelterId, shelterId)
        )
      );

    return rows.map((row) => this.mapOccurrenceRow(row));
  }

  async listDueOccurrences(
    shelterId: string,
    beforeDate: string
  ): Promise<CareEventOccurrence[]> {
    const rows = await this.db
      .select()
      .from(schema.careEventOccurrencesTable)
      .where(
        and(
          eq(schema.careEventOccurrencesTable.shelterId, shelterId),
          eq(schema.careEventOccurrencesTable.status, "PENDING"),
          lte(schema.careEventOccurrencesTable.dueDate, beforeDate)
        )
      );

    return rows.map((row) => this.mapOccurrenceRow(row));
  }

  async updateOccurrenceStatus(
    id: string,
    shelterId: string,
    status: CareOccurrenceStatus,
    completedAt?: string,
    notes?: string
  ): Promise<CareEventOccurrence> {
    const rows = await this.db
      .select()
      .from(schema.careEventOccurrencesTable)
      .where(
        and(
          eq(schema.careEventOccurrencesTable.id, id),
          eq(schema.careEventOccurrencesTable.shelterId, shelterId)
        )
      )
      .limit(1);

    if (rows.length === 0) {
      throw new Error(
        `Occurrence with ID ${id} not found in shelter ${shelterId}`
      );
    }

    const now = new Date().toISOString();
    const existing = this.mapOccurrenceRow(rows[0]);
    const updated: CareEventOccurrence = {
      ...existing,
      status,
      completedAt: completedAt !== undefined ? completedAt : existing.completedAt,
      notes: notes !== undefined ? notes : existing.notes,
      updatedAt: now,
    };

    await this.db
      .update(schema.careEventOccurrencesTable)
      .set({
        status: updated.status,
        completedAt: updated.completedAt,
        notes: updated.notes,
        updatedAt: updated.updatedAt,
      })
      .where(
        and(
          eq(schema.careEventOccurrencesTable.id, id),
          eq(schema.careEventOccurrencesTable.shelterId, shelterId)
        )
      );

    return updated;
  }

  async cancelFutureOccurrences(
    careEventId: string,
    shelterId: string
  ): Promise<number> {
    const now = new Date().toISOString();

    const pending = await this.db
      .select()
      .from(schema.careEventOccurrencesTable)
      .where(
        and(
          eq(schema.careEventOccurrencesTable.careEventId, careEventId),
          eq(schema.careEventOccurrencesTable.shelterId, shelterId),
          eq(schema.careEventOccurrencesTable.status, "PENDING")
        )
      );

    if (pending.length === 0) return 0;

    await this.db
      .update(schema.careEventOccurrencesTable)
      .set({
        status: "CANCELLED",
        updatedAt: now,
      })
      .where(
        and(
          eq(schema.careEventOccurrencesTable.careEventId, careEventId),
          eq(schema.careEventOccurrencesTable.shelterId, shelterId),
          eq(schema.careEventOccurrencesTable.status, "PENDING")
        )
      );

    return pending.length;
  }

  async cancelAllPetOccurrences(
    petId: string,
    shelterId: string
  ): Promise<number> {
    const now = new Date().toISOString();

    const pending = await this.db
      .select()
      .from(schema.careEventOccurrencesTable)
      .where(
        and(
          eq(schema.careEventOccurrencesTable.petId, petId),
          eq(schema.careEventOccurrencesTable.shelterId, shelterId),
          eq(schema.careEventOccurrencesTable.status, "PENDING")
        )
      );

    if (pending.length === 0) return 0;

    await this.db
      .update(schema.careEventOccurrencesTable)
      .set({
        status: "CANCELLED",
        updatedAt: now,
      })
      .where(
        and(
          eq(schema.careEventOccurrencesTable.petId, petId),
          eq(schema.careEventOccurrencesTable.shelterId, shelterId),
          eq(schema.careEventOccurrencesTable.status, "PENDING")
        )
      );

    return pending.length;
  }

  private mapCareEventRow(
    row: typeof schema.careEventsTable.$inferSelect
  ): CareEvent {
    return {
      id: row.id,
      shelterId: row.shelterId,
      petId: row.petId,
      appointmentId: row.appointmentId,
      modality: row.modality as CareEvent["modality"],
      substance: row.substance,
      instructions: row.instructions,
      isRecurring: Boolean(row.isRecurring),
      recurrenceIntervalValue: row.recurrenceIntervalValue,
      recurrenceIntervalUnit:
        row.recurrenceIntervalUnit as CareEvent["recurrenceIntervalUnit"],
      isTemporary: Boolean(row.isTemporary),
      startDate: row.startDate,
      endDate: row.endDate,
      status: row.status as CareEvent["status"],
      createdAt: row.createdAt,
      updatedAt: row.updatedAt,
    };
  }

  private mapOccurrenceRow(
    row: typeof schema.careEventOccurrencesTable.$inferSelect
  ): CareEventOccurrence {
    return {
      id: row.id,
      shelterId: row.shelterId,
      careEventId: row.careEventId,
      petId: row.petId,
      dueDate: row.dueDate,
      status: row.status as CareOccurrenceStatus,
      completedAt: row.completedAt,
      notes: row.notes,
      createdAt: row.createdAt,
      updatedAt: row.updatedAt,
    };
  }
}
