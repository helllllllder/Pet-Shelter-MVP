import { eq, and, lte } from 'drizzle-orm';
import { ICareEventRepository, IShelterSession } from '@core/contracts';
import { CareEventModel, CareEventOccurrenceModel, generateUUIDv7 } from '@core/domain';
import { careEvents, careEventOccurrences } from './schema';
import { BaseScopedRepository } from './base-repository';
import { calculateOccurrences } from '@core/domain/care-calculator';

export class DrizzleCareEventRepository extends BaseScopedRepository<CareEventModel> implements ICareEventRepository {
  constructor(session: IShelterSession, db: any) {
    super(session, db);
  }

  async getById(id: string): Promise<CareEventModel | null> {
    const rows = this.db
      .select()
      .from(careEvents)
      .where(and(eq(careEvents.id, id), eq(careEvents.shelterId, this.activeShelterId)))
      .all();

    if (rows.length === 0) return null;
    return rows[0];
  }

  async listByPet(petId: string): Promise<CareEventModel[]> {
    return this.db
      .select()
      .from(careEvents)
      .where(and(eq(careEvents.shelterId, this.activeShelterId), eq(careEvents.petId, petId)))
      .all();
  }

  async create(data: Omit<CareEventModel, 'id' | 'shelterId' | 'createdAt' | 'updatedAt'>): Promise<CareEventModel> {
    const id = generateUUIDv7();
    const now = new Date().toISOString();

    const record: CareEventModel = {
      ...data,
      id,
      shelterId: this.activeShelterId,
      createdAt: now,
      updatedAt: now,
    };

    this.db.insert(careEvents).values(record).run();

    // Generate initial occurrences
    const occurrences = calculateOccurrences(
      data.startDate,
      data.recurrenceIntervalUnit,
      data.recurrenceIntervalValue,
      12,
      data.endDate
    );

    for (const occ of occurrences) {
      this.db
        .insert(careEventOccurrences)
        .values({
          id: generateUUIDv7(),
          shelterId: this.activeShelterId,
          careEventId: id,
          petId: data.petId,
          dueDate: occ.dueDate,
          status: 'SCHEDULED',
          administeredAt: null,
          administeredByOperatorName: null,
          notes: null,
          createdAt: now,
          updatedAt: now,
        })
        .run();
    }

    return record;
  }

  async listOccurrencesDue(startDate: string, endDate: string): Promise<CareEventOccurrenceModel[]> {
    return this.db
      .select()
      .from(careEventOccurrences)
      .where(
        and(
          eq(careEventOccurrences.shelterId, this.activeShelterId),
          lte(careEventOccurrences.dueDate, endDate)
        )
      )
      .all();
  }

  async markAdministered(occurrenceId: string, operatorName: string, notes?: string): Promise<void> {
    const now = new Date().toISOString();
    this.db
      .update(careEventOccurrences)
      .set({
        status: 'ADMINISTERED',
        administeredAt: now,
        administeredByOperatorName: operatorName,
        notes: notes || null,
        updatedAt: now,
      })
      .where(
        and(
          eq(careEventOccurrences.id, occurrenceId),
          eq(careEventOccurrences.shelterId, this.activeShelterId)
        )
      )
      .run();
  }
}
