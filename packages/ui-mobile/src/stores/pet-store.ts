import { create } from "zustand";

export interface PetItem {
  id: string;
  shelterId: string;
  name: string;
  dateOfBirth: string;
  estimatedDOB: boolean;
  species: "Dog" | "Cat";
  breed?: string | null;
  sex?: "Male" | "Female" | null;
  color?: string | null;
  intakeOrigin: string;
  healthConditions: string[];
  healthStatus: "Healthy" | "InTreatment" | "Critical" | "UnderObservation";
  status: "active" | "in_foster" | "archived";
  availableForAdoption: boolean;
  outcome?: "adopted" | "deceased" | "transferred_external" | null;
  adopter?: {
    name: string;
    phone: string;
    email?: string;
    address?: string;
  } | null;
  createdAt: string;
  updatedAt: string;
}

export interface PetState {
  pets: PetItem[];
  selectedPetId: string | null;
  setPets: (pets: PetItem[]) => void;
  addPet: (pet: PetItem) => void;
  updatePet: (id: string, updates: Partial<PetItem>) => void;
  setSelectedPetId: (id: string | null) => void;
  getPetsForShelter: (shelterId: string) => PetItem[];
  getPetById: (id: string) => PetItem | null;
}

export const usePetStore = create<PetState>((set, get) => ({
  pets: [],
  selectedPetId: null,

  setPets: (pets) => set({ pets }),

  addPet: (pet) =>
    set((state) => ({
      pets: [pet, ...state.pets],
    })),

  updatePet: (id, updates) =>
    set((state) => ({
      pets: state.pets.map((p) =>
        p.id === id ? { ...p, ...updates, updatedAt: new Date().toISOString() } : p
      ),
    })),

  setSelectedPetId: (id) => set({ selectedPetId: id }),

  getPetsForShelter: (shelterId) => {
    return get().pets.filter((p) => p.shelterId === shelterId);
  },

  getPetById: (id) => {
    return get().pets.find((p) => p.id === id) ?? null;
  },
}));
