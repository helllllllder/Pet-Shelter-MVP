import { generateUUIDv7 } from '../uuid';
import { PetStatus } from '../pet-lifecycle';

export type CareModality = 'Vaccine' | 'Vermifuge' | 'Medication' | 'PhysicalTherapy' | 'Grooming';
export type RecurrenceUnit = 'hours' | 'days' | 'months' | 'years';
export type CareEventStatus = 'Pending' | 'Due' | 'Overdue' | 'Completed' | 'Cancelled';

export interface RecurrenceRule {
  interval: number;
  unit: RecurrenceUnit;
}

export interface CareEvent {
  id: string;
  shelterId: string;
  petId: string;
  modality: CareModality;
  substance?: string;
  instructions?: string;
  dueDate: Date;
  recurrenceRule?: RecurrenceRule;
  temporaryEndDate?: Date;
  appointmentId?: string;
  status: CareEventStatus;
  completedAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

export interface CareOccurrence {
  id: string;
  careEventId: string;
  scheduledDate: Date;
  actualDate?: Date;
  status: CareEventStatus;
  notes?: string;
  createdAt: Date;
  updatedAt: Date;
}

export class CareEventValidationError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'CareEventValidationError';
  }
}

export class CareEventEntity {
  static create(
    shelterId: string,
    petId: string,
    modality: CareModality,
    dueDate: Date,
    options?: {
      substance?: string;
      instructions?: string;
      recurrenceRule?: RecurrenceRule;
      temporaryEndDate?: Date;
      appointmentId?: string;
    },
  ): CareEvent {
    const validated = CareEventEntity.validate(dueDate, options);
    return {
      id: generateUUIDv7(),
      shelterId,
      petId,
      modality,
      substance: validated.substance,
      instructions: validated.instructions,
      dueDate: validated.dueDate,
      recurrenceRule: validated.recurrenceRule,
      temporaryEndDate: validated.temporaryEndDate,
      appointmentId: options?.appointmentId,
      status: 'Pending',
      createdAt: new Date(),
      updatedAt: new Date(),
    };
  }

  static markCompleted(event: CareEvent, actualDate: Date): CareEvent {
    return { ...event, status: 'Completed', completedAt: actualDate, updatedAt: new Date() };
  }

  static cancel(event: CareEvent): CareEvent {
    return { ...event, status: 'Cancelled', updatedAt: new Date() };
  }

  private static validate(
    dueDate: Date,
    options?: {
      substance?: string;
      instructions?: string;
      recurrenceRule?: RecurrenceRule;
      temporaryEndDate?: Date;
    },
  ): {
    dueDate: Date;
    substance?: string;
    instructions?: string;
    recurrenceRule?: RecurrenceRule;
    temporaryEndDate?: Date;
  } {
    if (dueDate > new Date()) {
      throw new CareEventValidationError('Due date cannot be in the future');
    }

    const rule = options?.recurrenceRule;
    if (rule) {
      if (rule.interval < 1) {
        throw new CareEventValidationError('Recurrence interval must be at least 1');
      }
      if (!['hours', 'days', 'months', 'years'].includes(rule.unit)) {
        throw new CareEventValidationError('Invalid recurrence unit');
      }
    }

    const tempEnd = options?.temporaryEndDate;
    if (tempEnd && tempEnd <= dueDate) {
      throw new CareEventValidationError('Temporary end date must be after due date');
    }

    return {
      dueDate,
      substance: options?.substance?.trim() || undefined,
      instructions: options?.instructions?.trim() || undefined,
      recurrenceRule: rule,
      temporaryEndDate: tempEnd,
    };
  }
}

export class CareOccurrenceEntity {
  static create(careEventId: string, scheduledDate: Date): CareOccurrence {
    if (!careEventId.trim()) {
      throw new CareEventValidationError('Care event ID is required');
    }
    return {
      id: generateUUIDv7(),
      careEventId: careEventId.trim(),
      scheduledDate,
      status: 'Pending',
      createdAt: new Date(),
      updatedAt: new Date(),
    };
  }

  static markCompleted(occurrence: CareOccurrence, actualDate: Date): CareOccurrence {
    return { ...occurrence, status: 'Completed', actualDate, updatedAt: new Date() };
  }

  static cancel(occurrence: CareOccurrence): CareOccurrence {
    return { ...occurrence, status: 'Cancelled', updatedAt: new Date() };
  }
}
