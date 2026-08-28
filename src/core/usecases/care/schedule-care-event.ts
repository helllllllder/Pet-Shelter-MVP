import { ICareEventRepository } from '@core/contracts';
import { CareEventModel, CareModality, RecurrenceUnit } from '@core/domain';

export interface ScheduleCareEventInput {
  petId: string;
  linkedAppointmentId?: string | null;
  modality: CareModality;
  substanceName?: string | null;
  dosage?: string | null;
  administrationInstructions?: string | null;
  recurrenceIntervalUnit: RecurrenceUnit;
  recurrenceIntervalValue: number;
  startDate: string; // YYYY-MM-DD
  endDate?: string | null;
}

export class ScheduleCareEventUseCase {
  constructor(private readonly careRepo: ICareEventRepository) {}

  async execute(input: ScheduleCareEventInput): Promise<CareEventModel> {
    return this.careRepo.create({
      petId: input.petId,
      linkedAppointmentId: input.linkedAppointmentId || null,
      modality: input.modality,
      substanceName: input.substanceName ? input.substanceName.trim() : null,
      dosage: input.dosage ? input.dosage.trim() : null,
      administrationInstructions: input.administrationInstructions ? input.administrationInstructions.trim() : null,
      recurrenceIntervalUnit: input.recurrenceIntervalUnit,
      recurrenceIntervalValue: input.recurrenceIntervalValue,
      startDate: input.startDate,
      endDate: input.endDate || null,
      status: 'ACTIVE',
    });
  }
}
