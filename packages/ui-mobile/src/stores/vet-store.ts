import { create } from "zustand";

export interface ClinicItem {
  id: string;
  shelterId: string;
  name: string;
  address?: string | null;
  phone?: string | null;
  email?: string | null;
  isEmergency: boolean;
  notes?: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface VeterinarianItem {
  id: string;
  shelterId: string;
  clinicId: string;
  name: string;
  specialization?: string | null;
  licenseNumber?: string | null;
  phone?: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface VetState {
  clinics: ClinicItem[];
  veterinarians: VeterinarianItem[];
  setClinics: (clinics: ClinicItem[]) => void;
  addClinic: (clinic: ClinicItem) => void;
  updateClinic: (id: string, updates: Partial<ClinicItem>) => void;
  deleteClinic: (id: string) => void;
  setVeterinarians: (vets: VeterinarianItem[]) => void;
  addVeterinarian: (vet: VeterinarianItem) => void;
  updateVeterinarian: (id: string, updates: Partial<VeterinarianItem>) => void;
  deleteVeterinarian: (id: string) => void;
}

export const useVetStore = create<VetState>((set) => ({
  clinics: [],
  veterinarians: [],

  setClinics: (clinics) => set({ clinics }),

  addClinic: (clinic) =>
    set((state) => ({
      clinics: [clinic, ...state.clinics],
    })),

  updateClinic: (id, updates) =>
    set((state) => ({
      clinics: state.clinics.map((c) =>
        c.id === id ? { ...c, ...updates, updatedAt: new Date().toISOString() } : c
      ),
    })),

  deleteClinic: (id) =>
    set((state) => ({
      clinics: state.clinics.filter((c) => c.id !== id),
      veterinarians: state.veterinarians.filter((v) => v.clinicId !== id),
    })),

  setVeterinarians: (veterinarians) => set({ veterinarians }),

  addVeterinarian: (vet) =>
    set((state) => ({
      veterinarians: [...state.veterinarians, vet],
    })),

  updateVeterinarian: (id, updates) =>
    set((state) => ({
      veterinarians: state.veterinarians.map((v) =>
        v.id === id ? { ...v, ...updates, updatedAt: new Date().toISOString() } : v
      ),
    })),

  deleteVeterinarian: (id) =>
    set((state) => ({
      veterinarians: state.veterinarians.filter((v) => v.id !== id),
    })),
}));
