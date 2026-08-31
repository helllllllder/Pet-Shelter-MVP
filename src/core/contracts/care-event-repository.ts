import type {
  CareEvent,
  CareEventOccurrence,
  CareOccurrenceStatus,
} from "../domain/models.js";

export interface ICareEventRepository {
  /**
   * Schedules or registers a new care event definition for a pet.
   */
  create(
    event: Omit<CareEvent, "createdAt" | "updatedAt">
  ): Promise<CareEvent>;

  /**
   * Updates an existing care event's instructions or recurrence parameters.
   */
  update(
    event: Partial<Omit<CareEvent, "createdAt" | "updatedAt">> & {
      id: string;
      shelterId: string;
    }
  ): Promise<CareEvent>;

  /**
   * Finds a care event by ID within a shelter.
   */
  findById(id: string, shelterId: string): Promise<CareEvent | null>;

  /**
   * Lists all care event definitions for a pet.
   */
  listByPet(petId: string, shelterId: string): Promise<CareEvent[]>;

  /**
   * Cancels/deletes a care event definition.
   */
  delete(id: string, shelterId: string): Promise<boolean>;

  /**
   * Bulk inserts generated occurrences for a care event series.
   */
  createOccurrences(
    occurrences: Omit<CareEventOccurrence, "createdAt" | "updatedAt">[]
  ): Promise<CareEventOccurrence[]>;

  /**
   * Lists all occurrences for a specific pet.
   */
  listOccurrencesByPet(
    petId: string,
    shelterId: string
  ): Promise<CareEventOccurrence[]>;

  /**
   * Lists occurrences due on or before a specified ISO timestamp for alert evaluation.
   */
  listDueOccurrences(
    shelterId: string,
    beforeDate: string
  ): Promise<CareEventOccurrence[]>;

  /**
   * Updates the status of an occurrence (e.g. COMPLETED, SKIPPED, CANCELLED).
   */
  updateOccurrenceStatus(
    id: string,
    shelterId: string,
    status: CareOccurrenceStatus,
    completedAt?: string,
    notes?: string
  ): Promise<CareEventOccurrence>;

  /**
   * Cancels all future pending occurrences of a specific care event.
   */
  cancelFutureOccurrences(
    careEventId: string,
    shelterId: string
  ): Promise<number>;

  /**
   * Cancels all pending occurrences for a pet across all its care events (e.g. on archival).
   */
  cancelAllPetOccurrences(
    petId: string,
    shelterId: string
  ): Promise<number>;
}
