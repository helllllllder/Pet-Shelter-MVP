import type { OperatorProfile } from "../domain/models.js";

export interface IOperatorRepository {
  /**
   * Retrieves the current local operator profile, or null if uninitialized.
   */
  getProfile(): Promise<OperatorProfile | null>;

  /**
   * Persists or registers a new local operator profile.
   */
  saveProfile(
    profile: Omit<OperatorProfile, "createdAt" | "updatedAt">
  ): Promise<OperatorProfile>;

  /**
   * Updates an existing operator profile's name or contact details.
   */
  updateProfile(
    profile: Partial<Omit<OperatorProfile, "id" | "createdAt" | "updatedAt">> & {
      id: string;
    }
  ): Promise<OperatorProfile>;
}
