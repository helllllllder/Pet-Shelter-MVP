import type { ICareEventRepository } from "../../../src/core/contracts/care-event-repository.js";
import type { IAuditLogRepository } from "../../../src/core/contracts/audit-log-repository.js";
import type {
  CareEvent,
  CareEventOccurrence,
  CareModality,
  RecurrenceIntervalUnit,
  AuditAction,
} from "../../../src/core/domain/models.js";
import { generateUUIDv7 } from "../../domain/src/index.js";

export interface CreateCareEventInput {
  petId: string;
  appointmentId?: string;
  modality: CareModality;
  substance?: string;
  instructions?: string;
  startDate?: string;
  dueDate?: string;
  endDate?: string | null;
  isRecurring: boolean;
  recurrenceIntervalValue?: number | null;
  recurrenceIntervalUnit?: RecurrenceIntervalUnit | null;
  isTemporary?: boolean;
  projectionCount?: number;
}

export interface CareNotificationPayload {
  occurrenceId: string;
  petId: string;
  modality: string;
  substance?: string;
  dueDate: string;
  title: string;
  body: string;
}

export class CareEventService {
  constructor(
    private readonly careEventRepo: ICareEventRepository,
    private readonly auditLogRepo: IAuditLogRepository
  ) {}

  // Helper for audit logging
  private async logAudit(
    shelterId: string,
    entityType: string,
    entityId: string,
    action: AuditAction,
    details?: any
  ): Promise<void> {
    await this.auditLogRepo.append({
      shelterId,
      entityType,
      entityId,
      action,
      actorType: "OPERATOR",
      actorId: "system",
      details: details ? JSON.stringify(details) : "",
    });
  }

  // Create Care Event and generate initial projected occurrences
  async createCareEvent(
    shelterId: string,
    input: CreateCareEventInput
  ): Promise<CareEvent> {
    const id = generateUUIDv7();
    const isTemporary = input.isTemporary ?? (input.endDate != null);
    const startTimestamp = input.dueDate || input.startDate || new Date().toISOString();

    const event = await this.careEventRepo.create({
      id,
      shelterId,
      petId: input.petId,
      appointmentId: input.appointmentId || null,
      modality: input.modality,
      substance: input.substance || null,
      instructions: input.instructions || null,
      isRecurring: input.isRecurring,
      recurrenceIntervalValue: input.recurrenceIntervalValue || null,
      recurrenceIntervalUnit: input.recurrenceIntervalUnit || null,
      isTemporary,
      startDate: startTimestamp,
      endDate: input.endDate || null,
      status: "ACTIVE",
    });

    await this.logAudit(shelterId, "CARE_EVENT", id, "CREATE", {
      petId: input.petId,
      modality: input.modality,
      isRecurring: input.isRecurring,
    });

    // Generate projected occurrences
    const occurrenceDates = this.projectOccurrenceDates(
      startTimestamp,
      input.isRecurring,
      input.recurrenceIntervalValue,
      input.recurrenceIntervalUnit,
      input.endDate,
      input.projectionCount
    );

    if (occurrenceDates.length > 0) {
      const occurrences = occurrenceDates.map((dueDate) => ({
        id: generateUUIDv7(),
        shelterId,
        careEventId: id,
        petId: input.petId,
        dueDate,
        status: "PENDING" as const,
        completedAt: null,
        notes: null,
      }));

      await this.careEventRepo.createOccurrences(occurrences);
    }

    return event;
  }

  // Project occurrence timestamps
  projectOccurrenceDates(
    startDateISO: string,
    isRecurring: boolean,
    intervalValue?: number | null,
    intervalUnit?: RecurrenceIntervalUnit | null,
    endDateISO?: string | null,
    maxCount?: number
  ): string[] {
    const dates: string[] = [startDateISO];
    if (!isRecurring || !intervalValue || !intervalUnit) {
      return dates;
    }

    const maxOccurrences = maxCount ?? (endDateISO ? 100 : 12);
    const endDateTime = endDateISO ? new Date(endDateISO).getTime() : Infinity;

    let currentDate = new Date(startDateISO);

    while (dates.length < maxOccurrences) {
      currentDate = this.addInterval(currentDate, intervalValue, intervalUnit);
      if (currentDate.getTime() > endDateTime) {
        break;
      }
      dates.push(currentDate.toISOString());
    }

    return dates;
  }

  private addInterval(date: Date, value: number, unit: RecurrenceIntervalUnit): Date {
    const next = new Date(date.getTime());
    switch (unit) {
      case "hours":
        next.setTime(next.getTime() + value * 60 * 60 * 1000);
        break;
      case "days":
        next.setDate(next.getDate() + value);
        break;
      case "months":
        next.setMonth(next.getMonth() + value);
        break;
      case "years":
        next.setFullYear(next.getFullYear() + value);
        break;
    }
    return next;
  }

  // Occurrences
  async listOccurrencesByPet(
    shelterId: string,
    petId: string
  ): Promise<CareEventOccurrence[]> {
    return this.careEventRepo.listOccurrencesByPet(petId, shelterId);
  }

  async listDueOccurrences(
    shelterId: string,
    beforeDate?: string
  ): Promise<CareEventOccurrence[]> {
    const cutoff = beforeDate || new Date().toISOString();
    return this.careEventRepo.listDueOccurrences(shelterId, cutoff);
  }

  async completeOccurrence(
    shelterId: string,
    occurrenceId: string,
    completedAt: string = new Date().toISOString(),
    notes?: string
  ): Promise<CareEventOccurrence> {
    const updated = await this.careEventRepo.updateOccurrenceStatus(
      occurrenceId,
      shelterId,
      "COMPLETED",
      completedAt,
      notes
    );

    await this.logAudit(shelterId, "CARE_EVENT_OCCURRENCE", occurrenceId, "UPDATE", {
      status: "COMPLETED",
      completedAt,
      notes,
    });

    return updated;
  }

  async skipOccurrence(
    shelterId: string,
    occurrenceId: string,
    notes?: string
  ): Promise<CareEventOccurrence> {
    const updated = await this.careEventRepo.updateOccurrenceStatus(
      occurrenceId,
      shelterId,
      "SKIPPED",
      undefined,
      notes
    );

    await this.logAudit(shelterId, "CARE_EVENT_OCCURRENCE", occurrenceId, "UPDATE", {
      status: "SKIPPED",
      notes,
    });

    return updated;
  }

  async cancelOccurrence(
    shelterId: string,
    occurrenceId: string
  ): Promise<CareEventOccurrence> {
    const updated = await this.careEventRepo.updateOccurrenceStatus(
      occurrenceId,
      shelterId,
      "CANCELLED"
    );

    await this.logAudit(shelterId, "CARE_EVENT_OCCURRENCE", occurrenceId, "UPDATE", {
      status: "CANCELLED",
    });

    return updated;
  }

  async cancelCareEvent(
    shelterId: string,
    careEventId: string
  ): Promise<number> {
    await this.careEventRepo.update({
      id: careEventId,
      shelterId,
      status: "CANCELLED",
    });

    const cancelledCount = await this.careEventRepo.cancelFutureOccurrences(
      careEventId,
      shelterId
    );

    await this.logAudit(shelterId, "CARE_EVENT", careEventId, "UPDATE", {
      status: "CANCELLED",
      cancelledOccurrencesCount: cancelledCount,
    });

    return cancelledCount;
  }

  // Local notifications generator
  generateNotificationPayloads(
    occurrences: CareEventOccurrence[],
    context?: { petName?: string; modality?: string; substance?: string }
  ): CareNotificationPayload[] {
    const petName = context?.petName || "Pet";
    const modalityName = context?.modality || "Care Event";
    return occurrences.map((occ) => {
      const title = `Due Care: ${modalityName}`;
      const substanceText = context?.substance ? ` (${context.substance})` : "";
      const body = `${petName} has a scheduled ${modalityName}${substanceText} due at ${occ.dueDate}.`;
      return {
        occurrenceId: occ.id,
        petId: occ.petId,
        modality: modalityName,
        substance: context?.substance,
        dueDate: occ.dueDate,
        title,
        body,
      };
    });
  }
}
