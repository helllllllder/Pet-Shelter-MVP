import { create } from "zustand";

export interface OperatorProfileItem {
  id: string;
  name: string;
  email: string;
  createdAt: string;
  updatedAt: string;
}

export interface OperatorState {
  profile: OperatorProfileItem | null;
  isConfigured: boolean;
  setProfile: (profile: OperatorProfileItem | null) => void;
}

export const useOperatorStore = create<OperatorState>((set) => ({
  profile: null,
  isConfigured: false,

  setProfile: (profile) => {
    set({
      profile,
      isConfigured: profile !== null,
    });
  },
}));
