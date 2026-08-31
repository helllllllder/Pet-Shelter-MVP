import type { VetAppointment, VetDocument } from "../domain/models.js";

export interface IAppointmentRepository {
  /**
   * Logs a new veterinary appointment for a pet.
   */
  create(
    appointment: Omit<
      VetAppointment,
      "createdAt" | "updatedAt" | "isDeleted" | "deletedAt"
    >
  ): Promise<VetAppointment>;

  /**
   * Updates an existing veterinary appointment record.
   */
  update(
    appointment: Partial<Omit<VetAppointment, "createdAt" | "updatedAt">> & {
      id: string;
      shelterId: string;
    }
  ): Promise<VetAppointment>;

  /**
   * Finds an appointment by ID within the shelter context.
   */
  findById(id: string, shelterId: string): Promise<VetAppointment | null>;

  /**
   * Lists chronological appointments for a specific pet.
   */
  listByPet(petId: string, shelterId: string): Promise<VetAppointment[]>;

  /**
   * Soft-deletes an appointment while preserving care event link placeholders.
   */
  softDelete(id: string, shelterId: string): Promise<boolean>;

  /**
   * Attaches a medical document (PDF, JPEG, PNG) to an appointment.
   */
  addDocument(doc: Omit<VetDocument, "createdAt">): Promise<VetDocument>;

  /**
   * Retrieves all documents attached to an appointment.
   */
  getDocuments(
    appointmentId: string,
    shelterId: string
  ): Promise<VetDocument[]>;

  /**
   * Deletes a document attached to an appointment.
   */
  deleteDocument(
    docId: string,
    appointmentId: string,
    shelterId: string
  ): Promise<boolean>;
}
