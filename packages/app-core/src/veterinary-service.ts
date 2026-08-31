import type { IVetDirectoryRepository } from "../../../src/core/contracts/vet-directory-repository.js";
import type { IAppointmentRepository } from "../../../src/core/contracts/appointment-repository.js";
import type { IAuditLogRepository } from "../../../src/core/contracts/audit-log-repository.js";
import type { VetClinic, Veterinarian, VetAppointment, VetDocument, AuditAction } from "../../../src/core/domain/models.js";
import { generateUUIDv7 } from "../../domain/src/index.js";
import * as fs from "node:fs/promises";
import * as path from "node:path";

export interface CreateClinicInput {
  name: string;
  address?: string;
  phone?: string;
  email?: string;
}

export interface CreateVeterinarianInput {
  clinicId: string;
  name: string;
  specialization?: string;
  phone?: string;
  email?: string;
}

export interface CreateAppointmentInput {
  petId: string;
  clinicId: string;
  veterinarianId?: string;
  appointmentDate: string;
  notes?: string;
}

export interface UploadAppointmentDocumentInput {
  fileName: string;
  mimeType: string;
  fileSizeBytes: number;
  buffer: Buffer;
}

export class VeterinaryService {
  private readonly storageDir: string;

  constructor(
    private readonly vetDirectoryRepo: IVetDirectoryRepository,
    private readonly appointmentRepo: IAppointmentRepository,
    private readonly auditLogRepo: IAuditLogRepository,
    storageDir?: string
  ) {
    this.storageDir = storageDir || path.join(process.cwd(), ".storage", "documents");
  }

  // Audit helper
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

  // Clinics
  async createClinic(shelterId: string, input: CreateClinicInput): Promise<VetClinic> {
    const id = generateUUIDv7();
    const clinic = await this.vetDirectoryRepo.createClinic({
      id,
      shelterId,
      name: input.name,
      address: input.address || null,
      phone: input.phone || null,
      email: input.email || null,
    });

    await this.logAudit(shelterId, "VET_CLINIC", id, "CREATE", { name: clinic.name });
    return clinic;
  }

  async updateClinic(
    shelterId: string,
    clinicId: string,
    input: Partial<CreateClinicInput>
  ): Promise<VetClinic> {
    const updated = await this.vetDirectoryRepo.updateClinic({
      id: clinicId,
      shelterId,
      name: input.name,
      address: input.address,
      phone: input.phone,
      email: input.email,
    });

    await this.logAudit(shelterId, "VET_CLINIC", clinicId, "UPDATE", input);
    return updated;
  }

  async getClinic(shelterId: string, clinicId: string): Promise<VetClinic | null> {
    return this.vetDirectoryRepo.findClinicById(clinicId, shelterId);
  }

  async listClinics(shelterId: string, search?: string): Promise<VetClinic[]> {
    if (search) {
      return this.vetDirectoryRepo.searchClinics(shelterId, search);
    }
    return this.vetDirectoryRepo.listClinics(shelterId);
  }

  async deleteClinic(shelterId: string, clinicId: string): Promise<boolean> {
    const result = await this.vetDirectoryRepo.softDeleteClinic(clinicId, shelterId);
    await this.logAudit(shelterId, "VET_CLINIC", clinicId, "DELETE", { deleted: result });
    return result;
  }

  // Veterinarians
  async createVeterinarian(
    shelterId: string,
    input: CreateVeterinarianInput
  ): Promise<Veterinarian> {
    const id = generateUUIDv7();
    const vet = await this.vetDirectoryRepo.createVeterinarian({
      id,
      shelterId,
      clinicId: input.clinicId,
      name: input.name,
      specialization: input.specialization || null,
      phone: input.phone || null,
      email: input.email || null,
    });

    await this.logAudit(shelterId, "VETERINARIAN", id, "CREATE", {
      name: vet.name,
      clinicId: vet.clinicId,
    });
    return vet;
  }

  async updateVeterinarian(
    shelterId: string,
    vetId: string,
    input: Partial<Omit<CreateVeterinarianInput, "clinicId">>
  ): Promise<Veterinarian> {
    const updated = await this.vetDirectoryRepo.updateVeterinarian({
      id: vetId,
      shelterId,
      name: input.name,
      specialization: input.specialization,
      phone: input.phone,
      email: input.email,
    });

    await this.logAudit(shelterId, "VETERINARIAN", vetId, "UPDATE", input);
    return updated;
  }

  async getVeterinarian(shelterId: string, vetId: string): Promise<Veterinarian | null> {
    return this.vetDirectoryRepo.findVeterinarianById(vetId, shelterId);
  }

  async listVeterinariansByClinic(
    shelterId: string,
    clinicId: string
  ): Promise<Veterinarian[]> {
    return this.vetDirectoryRepo.listVeterinariansByClinic(clinicId, shelterId);
  }

  async deleteVeterinarian(shelterId: string, vetId: string): Promise<boolean> {
    const result = await this.vetDirectoryRepo.softDeleteVeterinarian(vetId, shelterId);
    await this.logAudit(shelterId, "VETERINARIAN", vetId, "DELETE", { deleted: result });
    return result;
  }

  // Appointments
  async createAppointment(
    shelterId: string,
    input: CreateAppointmentInput
  ): Promise<VetAppointment> {
    const id = generateUUIDv7();
    const scheduledDate = new Date(input.appointmentDate);
    const isRetroactive = scheduledDate.getTime() < Date.now();

    const appt = await this.appointmentRepo.create({
      id,
      shelterId,
      petId: input.petId,
      clinicId: input.clinicId,
      veterinarianId: input.veterinarianId || null,
      appointmentDate: input.appointmentDate,
      isRetroactive,
      notes: input.notes || "",
    });

    await this.logAudit(shelterId, "VET_APPOINTMENT", id, "CREATE", {
      petId: input.petId,
      clinicId: input.clinicId,
      isRetroactive,
    });

    return appt;
  }

  async updateAppointment(
    shelterId: string,
    appointmentId: string,
    input: Partial<Omit<CreateAppointmentInput, "petId">>
  ): Promise<VetAppointment> {
    const isRetroactive =
      input.appointmentDate !== undefined
        ? new Date(input.appointmentDate).getTime() < Date.now()
        : undefined;

    const updated = await this.appointmentRepo.update({
      id: appointmentId,
      shelterId,
      clinicId: input.clinicId,
      veterinarianId: input.veterinarianId,
      appointmentDate: input.appointmentDate,
      isRetroactive,
      notes: input.notes,
    });

    await this.logAudit(shelterId, "VET_APPOINTMENT", appointmentId, "UPDATE", input);
    return updated;
  }

  async getAppointment(
    shelterId: string,
    appointmentId: string
  ): Promise<VetAppointment | null> {
    return this.appointmentRepo.findById(appointmentId, shelterId);
  }

  async listAppointmentsByPet(
    shelterId: string,
    petId: string
  ): Promise<VetAppointment[]> {
    return this.appointmentRepo.listByPet(petId, shelterId);
  }

  async deleteAppointment(
    shelterId: string,
    appointmentId: string
  ): Promise<boolean> {
    const result = await this.appointmentRepo.softDelete(appointmentId, shelterId);
    await this.logAudit(shelterId, "VET_APPOINTMENT", appointmentId, "DELETE", {
      deleted: result,
    });
    return result;
  }

  // Documents
  async uploadAppointmentDocument(
    shelterId: string,
    appointmentId: string,
    file: UploadAppointmentDocumentInput
  ): Promise<VetDocument> {
    const validMimes = ["application/pdf", "image/jpeg", "image/png"];
    if (!validMimes.includes(file.mimeType)) {
      throw new Error(`Unsupported document MIME type: ${file.mimeType}. Only PDF, JPEG, and PNG are allowed.`);
    }

    const docId = generateUUIDv7();
    const shelterDir = path.join(this.storageDir, shelterId, "appointments", appointmentId);
    await fs.mkdir(shelterDir, { recursive: true });

    const safeExt =
      path.extname(file.fileName) ||
      (file.mimeType === "application/pdf"
        ? ".pdf"
        : file.mimeType === "image/jpeg"
        ? ".jpg"
        : ".png");
    const filePath = path.join(shelterDir, `${docId}${safeExt}`);
    await fs.writeFile(filePath, file.buffer);

    const doc = await this.appointmentRepo.addDocument({
      id: docId,
      shelterId,
      appointmentId,
      fileName: file.fileName,
      filePath,
      fileSizeBytes: file.fileSizeBytes,
      mimeType: file.mimeType,
    });

    await this.logAudit(shelterId, "VET_DOCUMENT", docId, "CREATE", {
      appointmentId,
      fileName: file.fileName,
    });

    return doc;
  }

  async listAppointmentDocuments(
    shelterId: string,
    appointmentId: string
  ): Promise<VetDocument[]> {
    return this.appointmentRepo.getDocuments(appointmentId, shelterId);
  }

  async deleteAppointmentDocument(
    shelterId: string,
    appointmentId: string,
    documentId: string
  ): Promise<boolean> {
    const result = await this.appointmentRepo.deleteDocument(
      documentId,
      appointmentId,
      shelterId
    );

    await this.logAudit(shelterId, "VET_DOCUMENT", documentId, "DELETE", {
      appointmentId,
      deleted: result,
    });

    return result;
  }
}
