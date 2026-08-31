import type { Shelter } from "../domain/models.js";

export interface IShelterRepository {
  /**
   * Registers a new local shelter container.
   */
  create(
    shelter: Omit<Shelter, "createdAt" | "updatedAt">
  ): Promise<Shelter>;

  /**
   * Updates an existing shelter's name, description, or status.
   */
  update(
    shelter: Partial<Omit<Shelter, "createdAt" | "updatedAt">> & {
      id: string;
    }
  ): Promise<Shelter>;

  /**
   * Finds a shelter by its primary identifier.
   */
  findById(id: string): Promise<Shelter | null>;

  /**
   * Lists all local shelters on this device.
   */
  listAll(): Promise<Shelter[]>;
}
