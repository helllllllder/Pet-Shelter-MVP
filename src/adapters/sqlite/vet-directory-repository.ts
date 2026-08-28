import { eq, and, isNull } from 'drizzle-orm';
import { IVetDirectoryRepository, IShelterSession } from '@core/contracts';
import { VetClinicModel, VeterinarianModel, VetAppointmentModel, VetDocumentModel, generateUUIDv7 } from '@core/domain';
import { vetClinics, veterinarians, vetAppointments, vetDocuments } from './schema';
import { BaseScopedRepository } from './base-repository';

export class DrizzleVetDirectoryRepository extends BaseScopedRepository<VetClinicModel> implements IVetDirectoryRepository {
  constructor(session: IShelterSession, db: any) {
    super(session, db);
  }

  async listClinics(): Promise<VetClinicModel[]> {
    const rows = this.db
      .select()
      .from(vetClinics)
      .where(and(eq(vetClinics.shelterId, this.activeShelterId), isNull(vetClinics.deletedAt)))
      .all();

    return rows.map((r: any) => ({
      ...r,
      emergencyServices: Boolean(r.emergencyServices),
    }));
  }

  async listVetsByClinic(clinicId: string): Promise<VeterinarianModel[]> {
    const rows = this.db
      .select()
      .from(veterinarians)
      .where(
        and(
          eq(veterinarians.shelterId, this.activeShelterId),
          eq(veterinarians.clinicId, clinicId),
          isNull(veterinarians.deletedAt)
        )
      )
      .all();

    return rows;
  }

  async createClinic(data: Omit<VetClinicModel, 'id' | 'shelterId' | 'createdAt' | 'updatedAt' | 'deletedAt'>): Promise<VetClinicModel> {
    const id = generateUUIDv7();
    const now = new Date().toISOString();

    const record = {
      ...data,
      id,
      shelterId: this.activeShelterId,
      emergencyServices: Boolean(data.emergencyServices),
      createdAt: now,
      updatedAt: now,
      deletedAt: null,
    };

    this.db.insert(vetClinics).values(record).run();
    return record;
  }

  async createAppointment(data: Omit<VetAppointmentModel, 'id' | 'shelterId' | 'createdAt' | 'updatedAt' | 'deletedAt'>): Promise<VetAppointmentModel> {
    const id = generateUUIDv7();
    const now = new Date().toISOString();

    const record = {
      ...data,
      id,
      shelterId: this.activeShelterId,
      isRetroactive: Boolean(data.isRetroactive),
      createdAt: now,
      updatedAt: now,
      deletedAt: null,
    };

    this.db.insert(vetAppointments).values(record).run();
    return record;
  }

  async getAppointmentById(id: string): Promise<VetAppointmentModel | null> {
    const rows = this.db
      .select()
      .from(vetAppointments)
      .where(and(eq(vetAppointments.id, id), eq(vetAppointments.shelterId, this.activeShelterId)))
      .all();

    if (rows.length === 0) return null;
    return {
      ...rows[0],
      isRetroactive: Boolean(rows[0].isRetroactive),
    };
  }

  async softDeleteAppointment(id: string): Promise<void> {
    const now = new Date().toISOString();
    this.db
      .update(vetAppointments)
      .set({ deletedAt: now, updatedAt: now })
      .where(and(eq(vetAppointments.id, id), eq(vetAppointments.shelterId, this.activeShelterId)))
      .run();
  }

  async attachDocument(data: Omit<VetDocumentModel, 'id' | 'shelterId' | 'createdAt'>): Promise<VetDocumentModel> {
    const id = generateUUIDv7();
    const now = new Date().toISOString();

    const record = {
      ...data,
      id,
      shelterId: this.activeShelterId,
      createdAt: now,
    };

    this.db.insert(vetDocuments).values(record).run();
    return record;
  }

  async listDocumentsByAppointment(appointmentId: string): Promise<VetDocumentModel[]> {
    return this.db
      .select()
      .from(vetDocuments)
      .where(and(eq(vetDocuments.shelterId, this.activeShelterId), eq(vetDocuments.appointmentId, appointmentId)))
      .all();
  }
}
