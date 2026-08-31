import { create } from "zustand";

export interface ShelterItem {
  id: string;
  name: string;
  description?: string | null;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface ShelterState {
  shelters: ShelterItem[];
  activeShelterId: string | null;
  setShelters: (shelters: ShelterItem[]) => void;
  setActiveShelter: (id: string) => void;
  addShelter: (shelter: ShelterItem) => void;
  updateShelter: (id: string, updates: Partial<Omit<ShelterItem, "id" | "createdAt">>) => void;
  getActiveShelter: () => ShelterItem | null;
}

export const useShelterStore = create<ShelterState>((set, get) => ({
  shelters: [],
  activeShelterId: null,

  setShelters: (shelters) => {
    set((state) => {
      const activeId =
        state.activeShelterId && shelters.some((s) => s.id === state.activeShelterId)
          ? state.activeShelterId
          : shelters.length > 0
          ? shelters[0].id
          : null;
      return { shelters, activeShelterId: activeId };
    });
  },

  setActiveShelter: (id) => {
    set({ activeShelterId: id });
  },

  // US 6: Newly created shelters automatically become the active shelter context
  addShelter: (shelter) => {
    set((state) => ({
      shelters: [...state.shelters, shelter],
      activeShelterId: shelter.id,
    }));
  },

  updateShelter: (id, updates) => {
    set((state) => ({
      shelters: state.shelters.map((s) =>
        s.id === id ? { ...s, ...updates, updatedAt: new Date().toISOString() } : s
      ),
    }));
  },

  getActiveShelter: () => {
    const { shelters, activeShelterId } = get();
    if (!activeShelterId) return null;
    return shelters.find((s) => s.id === activeShelterId) ?? null;
  },
}));
