import { DrizzleVetDirectoryRepository } from '@adapters/sqlite';
import { VetAppointmentModel } from '@core/domain';

export interface LogAppointmentInput {
  petId: string;
  clinicId: string;
  veterinarianId?: string | null;
  appointmentDate: string; // ISO-8601 UTC
  reason: string;
  diagnosis?: string | null;
  prognosis?: string | null;
  confirmRetroactive?: boolean;
}

export class LogAppointmentUseCase {
  constructor(private readonly vetRepo: DrizzleVetDirectoryRepository) {}

  async execute(input: LogAppointmentInput): Promise<VetAppointmentModel> {
    const apptTime = new Date(input.appointmentDate).getTime();
    const nowTime = Date.now();
    const isPast = apptTime < nowTime - 60000; // More than 1 min in the past

    if (isPast && !input.confirmRetroactive) {
      throw new Error('[RETROACTIVE_CONFIRMATION_REQUIRED] Appointment date is in the past. Explicit confirmation is required.');
    }

    return this.vetRepo.createAppointment({
      petId: input.petId,
      clinicId: input.clinicId,
      veterinarianId: input.veterinarianId || null,
      appointmentDate: input.appointmentDate,
      reason: input.reason?.trim() || '',
      diagnosis: input.diagnosis ? input.diagnosis.trim() : null,
      prognosis: input.prognosis ? input.prognosis.trim() : null,
      isRetroactive: isPast,
    });
  }
}
