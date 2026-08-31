import type { VetClinic, Veterinarian } from "../domain/models.js";

export interface IVetDirectoryRepository {
  /**
   * Registers a new veterinary clinic in the shelter directory.
   */
  createClinic(
    clinic: Omit<VetClinic, "createdAt" | "updatedAt" | "isDeleted" | "deletedAt">
  ): Promise<VetClinic>;

  /**
   * Updates clinic details in the directory.
   */
  updateClinic(
    clinic: Partial<Omit<VetClinic, "createdAt" | "updatedAt">> & {
      id: string;
      shelterId: string;
    }
  ): Promise<VetClinic>;

  /**
   * Finds a clinic by ID within the active shelter directory.
   */
  findClinicById(id: string, shelterId: string): Promise<VetClinic | null>;

  /**
   * Lists clinics in the active shelter directory.
   */
  listClinics(
    shelterId: string,
    includeDeleted?: boolean
  ): Promise<VetClinic[]>;

  /**
   * Searches clinics by name within the active shelter.
   */
  searchClinics(shelterId: string, query: string): Promise<VetClinic[]>;

  /**
   * Soft-deletes a veterinary clinic to preserve appointment history.
   */
  softDeleteClinic(id: string, shelterId: string): Promise<boolean>;

  /**
   * Registers a veterinarian affiliated with a clinic in the directory.
   */
  createVeterinarian(
    vet: Omit<
      Veterinarian,
      "createdAt" | "updatedAt" | "isDeleted" | "deletedAt"
    >
  ): Promise<Veterinarian>;

  /**
   * Updates veterinarian details in the directory.
   */
  updateVeterinarian(
    vet: Partial<Omit<Veterinarian, "createdAt" | "updatedAt">> & {
      id: string;
      shelterId: string;
    }
  ): Promise<Veterinarian>;

  /**
   * Finds a veterinarian by ID within the active shelter directory.
   */
  findVeterinarianById(
    id: string,
    shelterId: string
  ): Promise<Veterinarian | null>;

  /**
   * Lists veterinarians affiliated with a clinic.
   */
  listVeterinariansByClinic(
    clinicId: string,
    shelterId: string,
    includeDeleted?: boolean
  ): Promise<Veterinarian[]>;

  /**
   * Soft-deletes a veterinarian from the directory.
   */
  softDeleteVeterinarian(id: string, shelterId: string): Promise<boolean>;
}
