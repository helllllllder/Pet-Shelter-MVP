import type {
  Pet,
  PetMedia,
  AdopterDetails,
  PetOutcomeStatus,
} from "../domain/models.js";

export interface PetSearchFilter {
  query?: string;
  species?: string;
  outcomeStatus?: PetOutcomeStatus | null;
  availableForAdoption?: boolean;
  isArchived?: boolean;
}

export interface IPetRepository {
  /**
   * Registers a new pet in the specified shelter.
   */
  create(pet: Omit<Pet, "createdAt" | "updatedAt">): Promise<Pet>;

  /**
   * Updates an existing pet profile within a shelter context.
   */
  update(
    pet: Partial<Omit<Pet, "createdAt" | "updatedAt">> & {
      id: string;
      shelterId: string;
    }
  ): Promise<Pet>;

  /**
   * Finds a pet profile by ID strictly scoped to the specified shelter.
   */
  findById(id: string, shelterId: string): Promise<Pet | null>;

  /**
   * Searches and filters pets strictly within the active shelter context.
   */
  search(shelterId: string, filter?: PetSearchFilter): Promise<Pet[]>;

  /**
   * Permanently hard-deletes a non-archived pet profile.
   */
  delete(id: string, shelterId: string): Promise<boolean>;

  /**
   * Associates an uploaded media asset with a pet profile.
   */
  addMedia(media: Omit<PetMedia, "createdAt">): Promise<PetMedia>;

  /**
   * Retrieves all media assets attached to a pet.
   */
  getMedia(petId: string, shelterId: string): Promise<PetMedia[]>;

  /**
   * Removes a specific media asset from a pet profile.
   */
  deleteMedia(
    mediaId: string,
    petId: string,
    shelterId: string
  ): Promise<boolean>;

  /**
   * Records adopter details upon adopting a pet.
   */
  saveAdopterDetails(
    details: Omit<AdopterDetails, "createdAt" | "updatedAt">
  ): Promise<AdopterDetails>;

  /**
   * Retrieves adopter details for an adopted pet.
   */
  getAdopterDetails(
    petId: string,
    shelterId: string
  ): Promise<AdopterDetails | null>;
}
