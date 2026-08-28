import { ShelterModel, PetModel, CareEventModel, VetAppointmentModel } from '@core/domain';

export interface ActiveContextState {
  activeShelterId: string | null;
  activeShelter: ShelterModel | null;
  isLoading: boolean;
  hasUnsavedChanges: boolean;
  switchContext: (targetShelterId: string) => Promise<void>;
  setHasUnsavedChanges: (hasChanges: boolean) => void;
}

export interface EntityCacheState {
  petsById: Record<string, PetModel>;
  careEventsById: Record<string, CareEventModel>;
  appointmentsById: Record<string, VetAppointmentModel>;
  invalidateCache: () => void;
}
