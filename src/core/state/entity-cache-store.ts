import { create } from 'zustand';
import { PetModel, CareEventModel, VetAppointmentModel } from '@core/domain';

export interface EntityCacheStore {
  pets: PetModel[];
  careEvents: CareEventModel[];
  appointments: VetAppointmentModel[];

  setPets: (pets: PetModel[]) => void;
  addPet: (pet: PetModel) => void;
  removePet: (petId: string) => void;
  clearCache: () => void;
}

export const useEntityCacheStore = create<EntityCacheStore>((set) => ({
  pets: [],
  careEvents: [],
  appointments: [],

  setPets: (pets) => set({ pets }),
  addPet: (pet) => set((state) => ({ pets: [pet, ...state.pets] })),
  removePet: (petId) => set((state) => ({ pets: state.pets.filter((p) => p.id !== petId) })),
  clearCache: () => set({ pets: [], careEvents: [], appointments: [] }),
}));
